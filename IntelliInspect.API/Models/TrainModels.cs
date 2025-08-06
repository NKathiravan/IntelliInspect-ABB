namespace IntelliInspect.Models
{
    public class TrainModelRequest
    {
        public string TrainStart { get; set; }
        public string TrainEnd { get; set; }
        public string TestStart { get; set; }
        public string TestEnd { get; set; }
    }

    public class TrainModelResponse
    {
        public string Message { get; set; }
        public Metrics Metrics { get; set; }
        public string TrainingChart { get; set; }
        public string DonutChart { get; set; }
    }

    public class Metrics
    {
        public double Accuracy { get; set; }
        public double Precision { get; set; }
        public double Recall { get; set; }
        public double F1_Score { get; set; }
    }
}
