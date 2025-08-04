namespace IntelliInspect.API.Models{
    public class DatasetMetadata
{
    public string FileName { get; set; }
    public int TotalRows { get; set; }
    public int TotalColumns { get; set; }
    public double PassRate { get; set; }
    public DateTime StartTimestamp { get; set; }
    public DateTime EndTimestamp { get; set; }
}
}