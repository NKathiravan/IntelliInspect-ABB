namespace IntelliInspect.API.Models
{
    public class SimulationResult
    {
        public DateTime Timestamp { get; set; }
        public string SampleId { get; set; } = string.Empty;
        public string Prediction { get; set; } = string.Empty; // "Pass" or "Fail"
        public double Confidence { get; set; } // e.g., 87.45
    }
}
