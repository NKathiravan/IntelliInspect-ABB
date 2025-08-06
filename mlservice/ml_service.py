# from datetime import datetime, timedelta
# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import Optional
# import pandas as pd
# import base64
# import requests
# from io import BytesIO
# from modelTraining import BoschQualityControlML
# from datetime import datetime
# from datetime import timedelta
# from fastapi.middleware.cors import CORSMiddleware


# app = FastAPI(title="Bosch ML Training API")
# origins = [
#     "http://localhost:5144",
# ]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# ml_system = BoschQualityControlML()


# class TrainRequest(BaseModel):
#     trainStart: str
#     trainEnd: str
#     testStart: str
#     testEnd: str


# def encode_fig(fig):
#     buffer = BytesIO()
#     fig.write_image(buffer, format="png")
#     buffer.seek(0)
#     return base64.b64encode(buffer.read()).decode("utf-8")


# def fetch_dataset_from_dotnet():
#     try:
#         url = "http://localhost:5144/api/dataset/download"
#         response = requests.get(url)
#         response.raise_for_status()
#         df = pd.read_csv(BytesIO(response.content))
#         return df
#     except Exception as e:
#         raise RuntimeError(f"Failed to fetch dataset: {e}")


# @app.post("/train-model")
# def train_model(request: TrainRequest):
#     try:
#         df_global = fetch_dataset_from_dotnet()
#         df_global['synthetic_timestamp'] = pd.to_datetime(df_global['synthetic_timestamp'])

#         train_start = pd.to_datetime(request.trainStart)
#         train_end = pd.to_datetime(request.trainEnd)
#         test_start = pd.to_datetime(request.testStart)
#         test_end = pd.to_datetime(request.testEnd)
#         start_time = datetime(2021, 1, 1, 0, 0, 0)
#         df_global['timestamp'] = [start_time + timedelta(seconds=i) for i in range(len(df_global))]
#         df_global['timestamp'] = pd.to_datetime(df_global['timestamp']) 

#         train_data = df_global[(df_global['timestamp'] >= train_start) & (df_global['timestamp'] <= train_end)]
#         test_data = df_global[(df_global['timestamp'] >= test_start) & (df_global['timestamp'] <= test_end)]

#         if train_data.empty or test_data.empty:
#             raise HTTPException(status_code=400, detail="Invalid date ranges: one or both datasets are empty.")

#         ml_system.train_model(train_data)
#         evaluation = ml_system.evaluate_model(test_data)

#         training_fig = ml_system.create_training_charts(evaluation)
#         donut_fig = ml_system.create_donut_chart(evaluation)

#         return {
#             "message": "Model Trained Successfully",
#             "metrics": {
#                 "accuracy": round(evaluation['accuracy'] * 100, 2),
#                 "precision": round(evaluation['precision'] * 100, 2),
#                 "recall": round(evaluation['recall'] * 100, 2),
#                 "f1_score": round(evaluation['f1_score'] * 100, 2),
#             },
#             "training_chart": encode_fig(training_fig),
#             "donut_chart": encode_fig(donut_fig)
#         }

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))





from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import base64
import requests
from io import BytesIO
from modelTraining import BoschQualityControlML
from fastapi.middleware.cors import CORSMiddleware
import traceback
from simulation import SimulationRequest, simulate_predictions
from fastapi.responses import StreamingResponse
import os

# Initialize FastAPI app
app = FastAPI(title="Bosch ML Training API")

# CORS configuration
origins = [
    "http://localhost:5144",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML System
ml_system = BoschQualityControlML()

# Request model
class TrainRequest(BaseModel):
    trainStart: str
    trainEnd: str
    testStart: str
    testEnd: str

# Utility: Encode a plotly figure as base64 PNG
def encode_fig(fig):
    buffer = BytesIO()
    fig.write_image(buffer, format="png")
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")

# Utility: Fetch dataset from .NET backend
def fetch_dataset_from_dotnet():
    try:
        url = "http://localhost:5144/api/dataset/download"
        response = requests.get(url)
        response.raise_for_status()
        df = pd.read_csv(BytesIO(response.content))
        os.makedirs("data", exist_ok=True)

        # Save the CSV to data/dataset.csv
        dataset_path = os.path.join("data", "dataset.csv")
        df.to_csv(dataset_path, index=False)
        return df
    except Exception as e:
        raise RuntimeError(f"Failed to fetch dataset: {e}")

# Main training endpoint
@app.post("/train-model")
def train_model(request: TrainRequest):
    try:
        # Step 1: Fetch and prepare dataset
        df_global = fetch_dataset_from_dotnet()

        # Optional: Parse existing timestamp field if needed
        if 'synthetic_timestamp' in df_global.columns:
            df_global['synthetic_timestamp'] = pd.to_datetime(df_global['synthetic_timestamp'])

        # Step 2: Generate synthetic 'timestamp' column
        start_time = datetime(2021, 1, 1, 0, 0, 0)
        df_global['timestamp'] = [start_time + timedelta(seconds=i) for i in range(len(df_global))]
        df_global['timestamp'] = pd.to_datetime(df_global['timestamp'])  # Ensure correct dtype

        # Step 3: Parse input dates to pandas timestamps for safe comparison
        train_start = pd.to_datetime(request.trainStart).tz_localize(None)
        train_end = pd.to_datetime(request.trainEnd).tz_localize(None)
        test_start = pd.to_datetime(request.testStart).tz_localize(None)
        test_end = pd.to_datetime(request.testEnd).tz_localize(None)

        # Step 4: Filter dataset
        train_data = df_global[(df_global['timestamp'] >= train_start) & (df_global['timestamp'] <= train_end)]
        test_data = df_global[(df_global['timestamp'] >= test_start) & (df_global['timestamp'] <= test_end)]

        if train_data.empty or test_data.empty:
            traceback.print_exc()
            raise HTTPException(status_code=400, detail="Invalid date ranges: one or both datasets are empty.")

        # Step 5: Train and evaluate model
        ml_system.train_model(train_data)
        ml_system.save_model()  # Save the trained model

        evaluation = ml_system.evaluate_model(test_data)

        # Step 6: Create visuals
        training_fig = ml_system.create_training_charts(evaluation)
        donut_fig = ml_system.create_donut_chart(evaluation)

        # Step 7: Return results
        return {
            "message": "Model Trained Successfully",
            "metrics": {
                "accuracy": round(evaluation['accuracy'] * 100, 2),
                "precision": round(evaluation['precision'] * 100, 2),
                "recall": round(evaluation['recall'] * 100, 2),
                "f1_score": round(evaluation['f1_score'] * 100, 2),
            },
            "TrainingChart": encode_fig(training_fig),
            "DonutChart": encode_fig(donut_fig)
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
@app.post("/simulate")
async def simulate(request: SimulationRequest):
    
    return StreamingResponse(simulate_predictions(request.StartDate, request.EndDate),
                              media_type="text/event-stream")