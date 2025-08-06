from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Generator
import pandas as pd
import joblib
import time
import json
import os

app = FastAPI()


class SimulationRequest(BaseModel):
    StartDate: str  # ISO format string
    EndDate: str


class ModelPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None

    def load_model(self, model_path='bosch_quality_model.pkl', scaler_path='bosch_scaler.pkl'):
        """Load trained model and scaler"""
        try:
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            print("Model and scaler loaded successfully!")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False

    def predict(self, row: pd.Series):
        features = row.values.reshape(1, -1)
        scaled = self.scaler.transform(features)
        prediction = self.model.predict(scaled)[0]
        confidence = max(self.model.predict_proba(scaled)[0])
        return prediction, confidence


predictor = ModelPredictor()
predictor.load_model()


def simulate_predictions(start: str, end: str) -> Generator[str, None, None]:
    # Simulated or historical dataset
    dataset_path = "data/dataset.csv"
    if not os.path.exists(dataset_path):
        yield f"data: {json.dumps({'error': 'Simulation dataset not found'})}\n\n"
        return
    start = pd.to_datetime(start).tz_localize(None)
    end = pd.to_datetime(end).tz_localize(None)  

    df = pd.read_csv(dataset_path, parse_dates=['synthetic_timestamp'])
    df['synthetic_timestamp'] = pd.to_datetime(df['synthetic_timestamp'])

    # Filter rows within date range
    df = df[(df['synthetic_timestamp'] >= start) & (df['synthetic_timestamp'] <= end)]
    if df.empty:
        yield f"data: {json.dumps({'error': 'No data in selected date range'})}\n\n"
        return

    # Simulate one row at a time
    for _, row in df.iterrows():
        sensor_data = row.drop(['synthetic_timestamp', 'Id','Response'])#, 'label'
        prediction, confidence = predictor.predict(sensor_data)

        result = {
            "timestamp": row["synthetic_timestamp"].isoformat(),
            "sample_id": row["Id"],
            "prediction": int(prediction),
            "confidence": float(round(confidence, 4)),
            "label": int(row["Response"]),  # Assuming 'Response' is the label
            "sensor_data": sensor_data.to_dict()
        }

        yield f"data: {json.dumps(result)}\n\n"
        time.sleep(1)  # simulate 1 row/sec



