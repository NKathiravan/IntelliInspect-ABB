namespace IntelliInspect.API.Models
{
    public class PeriodSummary
    {
        public string Name { get; set; }           // Training / Testing / Simulation
        public int DurationDays { get; set; }
        public int RecordCount { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
    }

    public class MonthlyBreakdown
    {
        public string Month { get; set; }          // "2025-08"
        public int Count { get; set; }
        public string RangeType { get; set; }      // Training / Testing / Simulation
    }

    public class DateRangeValidationResult
    {
        public string Status { get; set; }                     // Valid / Invalid
        public List<PeriodSummary> Periods { get; set; }       // One for each period
        public List<MonthlyBreakdown> MonthlyCounts { get; set; }
        public string Message { get; set; }                    // Validation message
    }
}
