import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# ML Libraries
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
from sklearn.preprocessing import StandardScaler
import joblib

# Visualization
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.offline as pyo




class BoschQualityControlML:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.training_history = []
        
    def load_and_preprocess_data(self, csv_path):
        """Load CSV data and add synthetic timestamps"""
        print("Loading and preprocessing data...")
        
        # Load the dataset
        df = pd.read_csv(csv_path)
        print(f"Loaded dataset with shape: {df.shape}")
        
        # Add synthetic timestamps with 1-second granularity
        # start_time = datetime(2024, 1, 1, 0, 0, 0)
        # df['timestamp'] = [start_time + timedelta(seconds=i) for i in range(len(df))]
        
        # Ensure Id column exists
        if 'Id' not in df.columns:

            df['Id'] = [f'ID_{i}' for i in range(len(df))]
        
        # Handle missing values
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        if 'Response' in numeric_columns:
            numeric_columns.remove('Response')
        
        # Fill missing values with median for numeric columns
        for col in numeric_columns:
            df[col] = df[col].fillna(df[col].median())
        
        # Store feature columns (excluding Id, timestamp, Response)
        self.feature_columns = [col for col in df.columns if col not in ['Id', 'timestamp', 'Response']]
        
        print(f"Feature columns: {len(self.feature_columns)}")
        print(f"Response distribution:\n{df['Response'].value_counts()}")
        
        return df
    
    def split_data_by_time(self, df, train_ratio=0.6, test_ratio=0.2, sim_ratio=0.2):
        """Split data based on consecutive non-overlapping timestamps"""
        print("Splitting data by timestamps...")
        
        # Sort by timestamp
        df_sorted = df.sort_values('timestamp').reset_index(drop=True)
        
        n = len(df_sorted)
        train_end = int(n * train_ratio)
        test_end = train_end + int(n * test_ratio)
        
        train_data = df_sorted[:train_end].copy()
        test_data = df_sorted[train_end:test_end].copy()
        sim_data = df_sorted[test_end:].copy()
        
        print(f"Train data: {len(train_data)} samples ({train_data['timestamp'].min()} to {train_data['timestamp'].max()})")
        print(f"Test data: {len(test_data)} samples ({test_data['timestamp'].min()} to {test_data['timestamp'].max()})")
        print(f"Simulation data: {len(sim_data)} samples ({sim_data['timestamp'].min()} to {sim_data['timestamp'].max()})")
        
        return train_data, test_data, sim_data
    
    def prepare_features(self, df, fit_scaler=False):
        """Prepare features for training/prediction"""
        X = df[self.feature_columns].copy()
        
        if fit_scaler:
            X_scaled = self.scaler.fit_transform(X)
        else:
            X_scaled = self.scaler.transform(X)
        
        return pd.DataFrame(X_scaled, columns=self.feature_columns, index=df.index)
    
    def train_model(self, train_data):
        """Train XGBoost model"""
        print("Training XGBoost model...")
        print(f"Training data shape: {train_data.shape}")
        print(train_data.head())

        if self.feature_columns is None:
         self.feature_columns = [
            col for col in train_data.columns
            if col not in ['Id', 'timestamp', 'Response', 'synthetic_timestamp']
            and pd.api.types.is_numeric_dtype(train_data[col])
        ]

         dropped = [col for col in train_data.columns if col not in self.feature_columns and col not in ['Id', 'timestamp', 'Response', 'synthetic_timestamp']]
         print(f"Dropped non-numeric or excluded columns: {dropped}")

        # Prepare features and target
        X_train = self.prepare_features(train_data, fit_scaler=True)
        y_train = train_data['Response']
        
        # XGBoost parameters
        params = {
            'objective': 'binary:logistic',
            'eval_metric': 'logloss',
            'max_depth': 6,
            'learning_rate': 0.1,
            'n_estimators': 100,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'random_state': 42,
            'base_score':0.5
        }
        
        # Train model with evaluation
        self.model = xgb.XGBClassifier(**params)
        
        # Fit with evaluation set for training history
        eval_set = [(X_train, y_train)]
        self.model.fit(
            X_train, y_train,
            eval_set=eval_set,
            verbose=True
        )
        
        # Store training history
        self.training_history = self.model.evals_result_['validation_0']['logloss']
        
        print("Model training completed!")
        return self.model
    
    def evaluate_model(self, test_data):
        """Evaluate model on test data"""
        print("Evaluating model...")
        
        # Prepare test features
        X_test = self.prepare_features(test_data)
        y_test = test_data['Response']
        
        # Make predictions
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        results = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'confusion_matrix': cm,
            'y_true': y_test,
            'y_pred': y_pred,
            'y_pred_proba': y_pred_proba
        }
        
        print(f"Accuracy: {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"F1-Score: {f1:.4f}")
        print(f"\nConfusion Matrix:")
        print(cm)
        
        return results
    
    def save_model(self, model_path='bosch_quality_model.pkl', scaler_path='bosch_scaler.pkl'):
        """Save trained model and scaler"""
        if self.model is not None:
            joblib.dump(self.model, model_path)
            joblib.dump(self.scaler, scaler_path)
            print(f"Model saved to {model_path}")
            print(f"Scaler saved to {scaler_path}")
        else:
            print("No model to save. Train the model first.")
    
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
    
    def create_training_charts(self, evaluation_results):
        """Create training and evaluation charts"""
        print("Creating training charts...")
        
        # Create subplots
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=['Training Loss', 'Model Performance Metrics', 
                          'Confusion Matrix', 'ROC Curve'],
            specs=[[{"secondary_y": False}, {"type": "bar"}],
                   [{"type": "heatmap"}, {"secondary_y": False}]]
        )
        
        # 1. Training Loss Chart
        epochs = list(range(1, len(self.training_history) + 1))
        fig.add_trace(
            go.Scatter(x=epochs, y=self.training_history, 
                      mode='lines', name='Training Loss',
                      line=dict(color='blue', width=2)),
            row=1, col=1
        )
        
        # 2. Performance Metrics Bar Chart
        metrics = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
        values = [evaluation_results['accuracy'], evaluation_results['precision'],
                 evaluation_results['recall'], evaluation_results['f1_score']]
        
        fig.add_trace(
            go.Bar(x=metrics, y=values, name='Metrics',
                  marker_color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']),
            row=1, col=2
        )
        
        # 3. Confusion Matrix Heatmap
        cm = evaluation_results['confusion_matrix']
        fig.add_trace(
            go.Heatmap(z=cm, x=['Predicted 0', 'Predicted 1'], 
                      y=['Actual 0', 'Actual 1'],
                      colorscale='Blues', showscale=True),
            row=2, col=1
        )
        
        # 4. ROC-like visualization (Prediction Distribution)
        y_pred_proba = evaluation_results['y_pred_proba']
        y_true = evaluation_results['y_true']
        
        # Create histogram of prediction probabilities
        prob_pass = y_pred_proba[y_true == 0]
        prob_fail = y_pred_proba[y_true == 1]
        
        fig.add_trace(
            go.Histogram(x=prob_pass, name='Pass (True)', opacity=0.7,
                        marker_color='green', nbinsx=20),
            row=2, col=2
        )
        fig.add_trace(
            go.Histogram(x=prob_fail, name='Fail (True)', opacity=0.7,
                        marker_color='red', nbinsx=20),
            row=2, col=2
        )
        
        # Update layout
        fig.update_layout(
            title_text="Bosch Quality Control - Model Training Results",
            showlegend=True,
            height=800
        )
        
        # Save the plot
        fig.write_html("training_results.html")
        fig.show()
        
        return fig
    
    def create_donut_chart(self, evaluation_results):
        """Create donut chart for prediction breakdown"""
        cm = evaluation_results['confusion_matrix']
        if cm.shape != (2, 2):
            new_cm = [[0, 0], [0, 0]]
        if cm.shape == (1, 1):
            # All predicted and actual are class 0
            new_cm[0][0] = cm[0][0]
        elif cm.shape == (1, 2):
            new_cm[0][0], new_cm[0][1] = cm[0]
        elif cm.shape == (2, 1):
            new_cm[0][0] = cm[0][0]
            new_cm[1][0] = cm[1][0]
        cm = np.array(new_cm)

        tn, fp, fn, tp = cm.ravel()
        
        labels = ['True Negative', 'False Positive', 'False Negative', 'True Positive']
        values = [tn, fp, fn, tp]
        colors = ['#2ECC71', '#E74C3C', '#F39C12', '#3498DB']
        
        fig = go.Figure(data=[go.Pie(
            labels=labels, 
            values=values,
            hole=.3,
            marker=dict(colors=colors)
        )])
        
        fig.update_layout(
            title="Model Performance Breakdown",
            annotations=[dict(text='Predictions', x=0.5, y=0.5, font_size=20, showarrow=False)]
        )
        
        fig.write_html("model_performance_donut.html")
        fig.show()
        
        return fig
    
    def simulate_real_time(self, sim_data, output_file='simulation_results.csv'):
        """Simulate real-time quality control predictions"""
        print("Starting real-time simulation...")
        
        results = []
        
        for idx, (_, row) in enumerate(sim_data.iterrows()):
            # Prepare single sample for prediction
            sample_df = pd.DataFrame([row])
            X_sample = self.prepare_features(sample_df)
            
            # Make prediction
            prediction = self.model.predict(X_sample)[0]
            confidence = self.model.predict_proba(X_sample)[0].max()
            
            # Store result
            result = {
                'timestamp': row['timestamp'],
                'Id': row['Id'],
                'prediction': prediction,
                'confidence': confidence,
                'quality_score': confidence if prediction == 0 else (1 - confidence),
                'status': 'PASS' if prediction == 0 else 'FAIL'
            }
            
            results.append(result)
            
            # Print progress every 100 samples
            if (idx + 1) % 100 == 0:
                print(f"Processed {idx + 1}/{len(sim_data)} samples")
        
        # Save results
        results_df = pd.DataFrame(results)
        results_df.to_csv(output_file, index=False)
        
        # Calculate simulation statistics
        total_samples = len(results_df)
        pass_count = len(results_df[results_df['prediction'] == 0])
        fail_count = len(results_df[results_df['prediction'] == 1])
        avg_confidence = results_df['confidence'].mean()
        
        stats = {
            'total': total_samples,
            'pass': pass_count,
            'fail': fail_count,
            'avg_confidence': avg_confidence
        }
        
        print(f"\nSimulation completed!")
        print(f"Total samples: {stats['total']}")
        print(f"Pass: {stats['pass']} ({stats['pass']/stats['total']*100:.1f}%)")
        print(f"Fail: {stats['fail']} ({stats['fail']/stats['total']*100:.1f}%)")
        print(f"Average confidence: {stats['avg_confidence']:.3f}")
        
        return results_df, stats

def main():
    """Main execution function"""
    print("Bosch Production Line Quality Control ML System")
    print("=" * 50)
    
    # Initialize the ML system
    ml_system = BoschQualityControlML()
    
    # Load and preprocess data
    csv_path = 'train_numeric.csv'  # Update with your actual path
    
    try:
        df = ml_system.load_and_preprocess_data(csv_path)
    except FileNotFoundError:
        print(f"Error: {csv_path} not found. Please ensure the file exists.")
        return
    
    # Split data by timestamps
    train_data, test_data, sim_data = ml_system.split_data_by_time(df)
    
    # Train the model
    model = ml_system.train_model(train_data)
    
    # Evaluate the model
    evaluation_results = ml_system.evaluate_model(test_data)
    
    # Save the model
    ml_system.save_model()
    
    # Create training charts
    ml_system.create_training_charts(evaluation_results)
    ml_system.create_donut_chart(evaluation_results)
    
    # Run simulation
    simulation_results, simulation_stats = ml_system.simulate_real_time(sim_data)
    
    print("\nML Pipeline completed successfully!")
    print("Files generated:")
    print("- bosch_quality_model.pkl (trained model)")
    print("- bosch_scaler.pkl (feature scaler)")
    print("- training_results.html (training charts)")
    print("- model_performance_donut.html (performance breakdown)")
    print("- simulation_results.csv (simulation data)")

if __name__ == "__main__":
    main()