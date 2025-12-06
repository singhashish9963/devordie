import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans


# ------------- CONFIG -------------

# Path to your JSON file (list of strategy docs like the ones you pasted)
DATA_PATH = Path("devordie.configurations.json")

# Max number of clusters you want (we will cap by number of samples)
MAX_CLUSTERS = 4

# All unit types we care about
UNIT_TYPES = ["soldier", "archer", "tank", "drone", "sniper", "medic"]


# ------------- FEATURE EXTRACTION -------------

def extract_features_from_army(units):
    """
    Extract numeric features from one team's army.
    `units` is a list of unit dicts from config.units.teamA (or teamB).
    """
    if len(units) == 0:
        # return zeros if no units (edge-case)
        base_counts = {f"count_{t}": 0 for t in UNIT_TYPES}
        base_feats = {
            "total_units": 0,
            "total_health": 0,
            "avg_health": 0,
            "total_attack": 0,
            "avg_attack": 0,
            "avg_range": 0,
            "avg_speed": 0,
            "avg_x": 0,
            "avg_y": 0,
            "std_x": 0,
            "std_y": 0,
            "formation_width": 0,
            "formation_height": 0,
            "ranged_fraction": 0,
        }
        return {**base_counts, **base_feats}

    types = [u.get("type", "") for u in units]
    xs = np.array([u["position"]["x"] for u in units], dtype=float)
    ys = np.array([u["position"]["y"] for u in units], dtype=float)
    health = np.array([u.get("health", 0) for u in units], dtype=float)
    attack = np.array([u.get("attack", 0) for u in units], dtype=float)
    speed = np.array([u.get("speed", 0) for u in units], dtype=float)
    range_ = np.array([u.get("range", 0) for u in units], dtype=float)

    def count(t):
        return sum(1 for tp in types if tp == t)

    total_units = len(units)

    features = {}

    # counts per type
    for t in UNIT_TYPES:
        features[f"count_{t}"] = count(t)

    # basic aggregates
    features["total_units"] = total_units
    features["total_health"] = float(health.sum())
    features["avg_health"] = float(health.mean())
    features["total_attack"] = float(attack.sum())
    features["avg_attack"] = float(attack.mean())
    features["avg_range"] = float(range_.mean())
    features["avg_speed"] = float(speed.mean())

    # formation / position features
    features["avg_x"] = float(xs.mean())
    features["avg_y"] = float(ys.mean())
    features["std_x"] = float(xs.std())
    features["std_y"] = float(ys.std())
    features["formation_width"] = float(xs.max() - xs.min())
    features["formation_height"] = float(ys.max() - ys.min())

    # ranged_fraction: archers + snipers + drones
    ranged_units = count("archer") + count("sniper") + count("drone")
    features["ranged_fraction"] = ranged_units / total_units if total_units > 0 else 0.0

    return features


def extract_army_from_doc(doc, team="teamA"):
    """
    Safely get the list of units for a given team from a document.
    """
    try:
        return doc["config"]["units"][team]
    except KeyError:
        return []


# ------------- LOAD DATA -------------

def load_strategy_docs(path: Path):
    """
    Load a list of strategy documents from the given JSON path.
    The file should contain a JSON array like the one you pasted.
    """
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def build_feature_dataframe(docs, team="teamA"):
    """
    Build a pandas DataFrame of features for each strategy document for a given team.
    Returns:
      df_full: meta + features
      df_features: only numeric feature columns
    """
    rows = []
    meta = []

    for doc in docs:
        army = extract_army_from_doc(doc, team=team)
        features = extract_features_from_army(army)

        # store some metadata to help you interpret clusters later
        meta_row = {
            "_id": doc.get("_id", {}),
            "name": doc.get("name", ""),
            "userId": doc.get("userId", {}),
            "team": team,
        }

        rows.append(features)
        meta.append(meta_row)

    df_features = pd.DataFrame(rows)
    df_meta = pd.DataFrame(meta)

    # combine meta + features, but keep them logically separate
    df_full = pd.concat([df_meta, df_features], axis=1)
    return df_full, df_features


# ------------- CLUSTERING / PLAYSTYLE PROFILING -------------

def train_playstyle_model(df_features):
    """
    Train a clustering model (KMeans) on the feature DataFrame.
    Returns:
      scaler, kmeans, cluster_all
    """
    X = df_features.values
    n_samples = X.shape[0]

    if n_samples < 2:
        raise ValueError("Need at least 2 strategies to perform clustering.")

    # Train/test split is not essential for clustering, but we keep it for good practice
    test_size = min(0.2, 1.0 / n_samples)
    X_train, X_test = train_test_split(
        X, test_size=test_size, random_state=42
    )

    # Standardize features (important for clustering)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    _ = scaler.transform(X_test)  # we don't actually use X_test further here

    # Choose number of clusters (cannot exceed n_samples)
    n_clusters = min(MAX_CLUSTERS, X_train_scaled.shape[0])
    if n_clusters < 2:
        n_clusters = 2  # minimum for KMeans

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    kmeans.fit(X_train_scaled)

    # Assign clusters for all data (train + test + full)
    X_all_scaled = scaler.transform(X)
    cluster_all = kmeans.predict(X_all_scaled)

    return scaler, kmeans, cluster_all


def name_clusters(df_with_clusters, feature_cols, team_label):
    """
    Helper to inspect cluster means and optionally assign human-readable names.
    For now, we assign generic names. You can manually refine after inspection.
    """
    cluster_stats = df_with_clusters.groupby("cluster")[feature_cols].mean()

    print(f"\n=== Cluster Feature Means for {team_label} (to help you name them) ===")
    print(cluster_stats)

    # Auto-generate generic names like "TeamA Playstyle 0", "TeamB Playstyle 1"
    cluster_names = {
        c: f"{team_label} Playstyle {c}" for c in df_with_clusters["cluster"].unique()
    }

    return cluster_names, cluster_stats


# ------------- PIPELINE FOR ONE TEAM -------------

def run_pipeline_for_team(docs, team_label, out_csv_name):
    """
    Run full profiling pipeline for a specific team (teamA or teamB).
    Returns:
      df_with_clusters, scaler, kmeans, cluster_names
    """
    print(f"\n========== Processing {team_label} ==========")
    df_full, df_features = build_feature_dataframe(docs, team=team_label)
    print(f"Built feature DataFrame for {team_label} with shape: {df_features.shape}")

    print(f"\n=== Sample rows for {team_label} ===")
    print(df_full.head())

    scaler, kmeans, cluster_all = train_playstyle_model(df_features)
    df_full["cluster"] = cluster_all

    feature_cols = df_features.columns.tolist()
    cluster_names, cluster_stats = name_clusters(df_full, feature_cols, team_label)
    df_full["playstyle_name"] = df_full["cluster"].map(cluster_names)

    print(f"\n=== Strategies with assigned playstyle clusters for {team_label} ===")
    print(df_full[["name", "userId", "team", "cluster", "playstyle_name"]].head(20))

    # Save results for this team
    out_path = Path(out_csv_name)
    df_full.to_csv(out_path, index=False)
    print(f"\nSaved {team_label} cluster assignment to {out_path.absolute()}")

    return df_full, scaler, kmeans, cluster_names, feature_cols


# ------------- MAIN PIPELINE -------------

def main():
    # 1. Load docs
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"{DATA_PATH} not found. Put your strategy JSON there."
        )

    docs = load_strategy_docs(DATA_PATH)
    print(f"Loaded {len(docs)} strategy documents.")

    # 2. Run pipeline separately for teamA and teamB
    df_teamA, scaler_A, kmeans_A, cluster_names_A, feature_cols_A = run_pipeline_for_team(
        docs, team_label="teamA", out_csv_name="playstyle_clusters_teamA.csv"
    )

    df_teamB, scaler_B, kmeans_B, cluster_names_B, feature_cols_B = run_pipeline_for_team(
        docs, team_label="teamB", out_csv_name="playstyle_clusters_teamB.csv"
    )

    # 3. Example: how you would label a single new army for teamA / teamB

    print("\n=== Example: functions to label a single new army for teamA / teamB ===")

    def label_new_army(units, team_label="teamA"):
        """
        Given a list of units (same structure as config.units.teamA or teamB),
        return playstyle for that team using the corresponding model.
        """
        if team_label == "teamA":
            feats = extract_features_from_army(units)
            x = np.array([feats[c] for c in feature_cols_A], dtype=float).reshape(1, -1)
            x_scaled = scaler_A.transform(x)
            cluster_id = kmeans_A.predict(x_scaled)[0]
            playstyle = cluster_names_A.get(cluster_id, f"teamA Playstyle {cluster_id}")
        elif team_label == "teamB":
            feats = extract_features_from_army(units)
            x = np.array([feats[c] for c in feature_cols_B], dtype=float).reshape(1, -1)
            x_scaled = scaler_B.transform(x)
            cluster_id = kmeans_B.predict(x_scaled)[0]
            playstyle = cluster_names_B.get(cluster_id, f"teamB Playstyle {cluster_id}")
        else:
            raise ValueError("team_label must be 'teamA' or 'teamB'")

        return {
            "team": team_label,
            "cluster": int(cluster_id),
            "playstyle_name": playstyle,
            "features": feats,
        }

    # Example usage (uncomment when you have enough data):
    # example_units_A = docs[0]["config"]["units"]["teamA"]
    # example_units_B = docs[0]["config"]["units"]["teamB"]
    # print(label_new_army(example_units_A, team_label="teamA"))
    # print(label_new_army(example_units_B, team_label="teamB"))


if __name__ == "__main__":
    main()
