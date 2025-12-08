from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import joblib

from playstyle_profiling import extract_features_from_army  # reuse your logic


app = FastAPI()

# Load trained models at startup
model_A = joblib.load("teamA_playstyle_model.pkl")
model_B = joblib.load("teamB_playstyle_model.pkl")


class Position(BaseModel):
    x: float
    y: float


class Unit(BaseModel):
    type: str
    position: Position
    health: Optional[float] = None
    attack: Optional[float] = None
    defense: Optional[float] = None
    speed: Optional[float] = None
    range: Optional[float] = None


class PlaystyleRequest(BaseModel):
    teamLabel: str   # "teamA" or "teamB"
    units: List[Unit]


@app.post("/ml/playstyle")
def playstyle(req: PlaystyleRequest):
    # 1. Pick model for the right team
    if req.teamLabel == "teamA":
        model = model_A
    elif req.teamLabel == "teamB":
        model = model_B
    else:
        return {"error": "teamLabel must be 'teamA' or 'teamB'"}

    # 2. Convert Pydantic models to dicts
    units_raw = [u.dict() for u in req.units]

    # 3. Extract features (same as training)
    feats = extract_features_from_army(units_raw)

    # 4. Arrange features in the exact order used in training
    feature_cols = model["feature_cols"]
    x = np.array([feats[c] for c in feature_cols], dtype=float).reshape(1, -1)

    # 5. Scale + predict cluster
    x_scaled = model["scaler"].transform(x)
    cluster_id = int(model["kmeans"].predict(x_scaled)[0])

    # 6. Human-readable playstyle name
    playstyle_name = model["cluster_names"].get(
        cluster_id, f"{req.teamLabel} Playstyle {cluster_id}"
    )

    return {
        "team": req.teamLabel,
        "cluster": cluster_id,
        "playstyleName": playstyle_name,
        "features": feats,
    }
