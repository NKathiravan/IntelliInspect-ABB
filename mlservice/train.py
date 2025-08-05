from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import pandas as pd
import xgboost as xgb
import tempfile
import os
import uvicorn
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import numpy as np

app = FastAPI()

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    try:
        # Store the streamed file in a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as temp_file:
            temp_file_path = temp_file.name
            content = await file.read()
            temp_file.write(content)

        # Read the CSV dataset using pandas
        df = pd.read_csv(temp_file_path)

        # Delete temp file after reading
        os.remove(temp_file_path)

        # Ensure we have enough columns
        if df.shape[1] < 2:
            raise HTTPException(status_code=400, detail="Dataset must contain features and a target")

        # Assume the last column is the target
        X = df.iloc[:, :-1]
        y = df.iloc[:, -1]

        # Split dataset
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Train XGBoost model
        model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='logloss')
        model.fit(X_train, y_train)

        # Predict
        y_pred = model.predict(X_test)

        # Compute metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='macro', zero_division=0)
        recall = recall_score(y_test, y_pred, average='macro', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='macro', zero_division=0)

        return JSONResponse(content={
            "message": "Model trained successfully",
            "metrics": {
                "accuracy": round(accuracy, 4),
                "precision": round(precision, 4),
                "recall": round(recall, 4),
                "f1_score": round(f1, 4)
            }
        })

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Optional: run with `python ml_service.py`
if __name__ == "__main__":
    uvicorn.run("ml_service:app", host="0.0.0.0", port=8000, reload=True)
