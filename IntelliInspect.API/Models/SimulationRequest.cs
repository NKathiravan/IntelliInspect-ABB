using System.Text.Json.Serialization;
namespace IntelliInspect.API.Models
{
    public class SimulationRequest
    {
        [JsonPropertyName("StartDate")]
        public DateTime StartDate { get; set; }
        [JsonPropertyName("EndDate")]
        public DateTime EndDate { get; set; }
    }
}
