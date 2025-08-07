# IntelliInspect README

## Project Overview

**IntelliInspect** is a full-stack AI-powered web application for real-time predictive quality control using Kaggle production line sensor data. It features an Angular frontend, ASP.NET Core backend, and Python ML service with FastAPI, all containerized via Docker. The app supports dataset upload with synthetic timestamp augmentation, date range validation, model training, and real-time simulation.

This repository contains the complete source code for the application, designed for the hackathon specifications. For detailed design, refer to the included design document (e.g., `design_document.pdf`).

## Prerequisites

- Docker and Docker Compose installed (version 20.10+ recommended).
- Git for cloning the repository.
- Access to the Kaggle dataset (download from [Bosch Production Line Performance](https://www.kaggle.com/c/bosch-production-line-performance/data)).
- Minimum hardware: 8GB RAM, multi-core CPU (for ML training).


## Setup and Deployment Instructions (Docker-Based)

The application is fully containerized and can be deployed using Docker Compose. This ensures a consistent environment across development and production.

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/intelliinspect.git
cd intelliinspect
```


### Step 2: Prepare the Environment

- Ensure you have a `docker-compose.yaml` file in the root directory (included in the repo). It defines three services:
    - `frontend-angular`: Angular app on port 4200.
    - `backend-dotnet`: ASP.NET Core API on port 5000.
    - `ml-service-python`: FastAPI ML service on port 8000.
- (Optional) Create a `.env` file for custom configurations (e.g., `DATASET_PATH=/path/to/initial/dataset.csv` if pre-loading data).


### Step 3: Build and Run the Containers

- Build and start the services:

```bash
docker-compose up --build
```

    - This command builds the Docker images from the respective Dockerfiles (e.g., `frontend/Dockerfile`, `backend/Dockerfile`, `ml-service/Dockerfile`) and starts the containers.
    - The services communicate via an internal Docker network.
- Access the application:
    - Frontend: Open `http://localhost:4200` in your browser.
    - Backend API: `http://localhost:5000/api` (for testing).
    - ML Service: `http://localhost:8000` (internal use).


### Step 4: Stopping and Cleanup

- Stop the containers:

```bash
docker-compose down
```

- Remove volumes/images if needed:

```bash
docker-compose down -v --rmi all
```


### Troubleshooting Deployment

- **Port Conflicts**: Ensure ports 4200, 5000, and 8000 are free.
- **Build Errors**: Verify Dockerfiles and dependencies (e.g., Node.js for Angular, .NET SDK for backend, Python packages for ML).
- **Logs**: Use `docker-compose logs` to debug.
- **First Run**: Initial build may take 5-10 minutes due to dependency installation.


## Usage Guide

Follow these steps to use the IntelliInspect application after deployment.

### 1. Accessing the Application

- Open `http://localhost:4200` in a web browser (e.g., Chrome or Firefox).
- The app loads with a step progress indicator and tab navigation.


### 2. Uploading the Dataset

- Navigate to the "Upload Dataset" screen (Step 1 of 4).
- Use the drag-and-drop area or "Choose File" button to select the Kaggle CSV dataset.
- The system validates the file, augments it with synthetic timestamps (if missing), and displays metadata (e.g., total records, columns, pass rate, date range).
- Click "Next" to proceed once metadata is shown.


### 3. Configuring Date Ranges

- On the "Date Ranges" screen (Step 2 of 4), use the calendar pickers to define non-overlapping periods for Training, Testing, and Simulation.
- Click "Validate Ranges" to check against the dataset's timestamps.
- Review the summary cards (duration, record counts) and timeline bar chart.
- If valid, click "Next" to continue.


### 4. Performing Model Training

- On the "Model Training" screen (Step 3 of 4), click "Train Model" to initiate training using the defined ranges.
- View results including metrics (accuracy, precision, recall, F1-score), training history line chart, and confusion matrix donut chart.
- Once complete, click "Next".


### 5. Running the Real-Time Simulation

- On the "Simulation" screen (Step 4 of 4), click "Start Simulation" to begin row-by-row processing (1 row/second).
- Monitor live updates: quality predictions line chart, confidence donut chart, statistics panel (total/pass/fail counts, average confidence), and streaming table (timestamp, sample ID, prediction, confidence, parameters).
- The simulation auto-completes; click "Restart Simulation" to run again.
- Stop manually if needed via the controls.

For optimal performance, use a stable internet connection and avoid closing the browser during long simulations. Refer to the design document for API details and advanced features. If issues occur, check container logs or the troubleshooting section.


