import json
from pathlib import Path
import joblib  # <-- add this

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans


# ------------- CONFIG -------------

DATA_PATH = Path("devordie.configurations.json")
MAX_CLUSTERS = 4
UNIT_TYPES = ["soldier", "archer", "tank", "drone", "sniper", "medic"]


# ------------- FEATURE EXTRACTION -------------

def extract_features_from_army(units):
    """
    Extract numeric features from one team's army.
    `units` is a list of unit dicts from config.units.teamA (or teamB).
    """
    if len(units) == 0:
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
    try:
        return doc["config"]["units"][team]
    except KeyError:
        return []


# ------------- LOAD DATA -------------

def load_strategy_docs(path: Path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def build_feature_dataframe(docs, team="teamA"):
    rows = []
    meta = []

    for doc in docs:
        army = extract_army_from_doc(doc, team=team)
        features = extract_features_from_army(army)

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

    df_full = pd.concat([df_meta, df_features], axis=1)
    return df_full, df_features


# ------------- CLUSTERING / PLAYSTYLE PROFILING -------------

def train_playstyle_model(df_features):
    X = df_features.values
    n_samples = X.shape[0]

    if n_samples < 2:
        raise ValueError("Need at least 2 strategies to perform clustering.")

    test_size = min(0.2, 1.0 / n_samples)
    X_train, X_test = train_test_split(
        X, test_size=test_size, random_state=42
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    _ = scaler.transform(X_test)

    n_clusters = min(MAX_CLUSTERS, X_train_scaled.shape[0])
    if n_clusters < 2:
        n_clusters = 2

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init="auto")
    kmeans.fit(X_train_scaled)

    X_all_scaled = scaler.transform(X)
    cluster_all = kmeans.predict(X_all_scaled)

    return scaler, kmeans, cluster_all


def name_clusters(df_with_clusters, feature_cols, team_label):
    cluster_stats = df_with_clusters.groupby("cluster")[feature_cols].mean()

    print(f"\n=== Cluster Feature Means for {team_label} (to help you name them) ===")
    print(cluster_stats)

    cluster_names = {
        c: f"{team_label} Playstyle {c}" for c in df_with_clusters["cluster"].unique()
    }

    return cluster_names, cluster_stats


# ------------- PIPELINE FOR ONE TEAM -------------

def run_pipeline_for_team(docs, team_label, out_csv_name):
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

    out_path = Path(out_csv_name)
    df_full.to_csv(out_path, index=False)
    print(f"\nSaved {team_label} cluster assignment to {out_path.absolute()}")

    return df_full, scaler, kmeans, cluster_names, feature_cols


# ------------- MAIN PIPELINE -------------

def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"{DATA_PATH} not found. Put your strategy JSON there."
        )

    docs = load_strategy_docs(DATA_PATH)
    print(f"Loaded {len(docs)} strategy documents.")

    df_teamA, scaler_A, kmeans_A, cluster_names_A, feature_cols_A = run_pipeline_for_team(
        docs, team_label="teamA", out_csv_name="playstyle_clusters_teamA.csv"
    )

    df_teamB, scaler_B, kmeans_B, cluster_names_B, feature_cols_B = run_pipeline_for_team(
        docs, team_label="teamB", out_csv_name="playstyle_clusters_teamB.csv"
    )

    print("\n=== Example: functions to label a single new army for teamA / teamB ===")

    def label_new_army(units, team_label="teamA"):
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

    # ---- NEW: save models to disk here ----
    joblib.dump({
        "scaler": scaler_A,
        "kmeans": kmeans_A,
        "cluster_names": cluster_names_A,
        "feature_cols": feature_cols_A,
    }, "teamA_playstyle_model.pkl")

    joblib.dump({
        "scaler": scaler_B,
        "kmeans": kmeans_B,
        "cluster_names": cluster_names_B,
        "feature_cols": feature_cols_B,
    }, "teamB_playstyle_model.pkl")

    print("\nSaved playstyle models: teamA_playstyle_model.pkl, teamB_playstyle_model.pkl")


if __name__ == "__main__":
    main()
