using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Text.Json;
//using Newtonsoft.Json;
using System.Threading.Tasks;
using IntelliInspect.Models;


namespace IntelliInspectBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TrainModelController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public TrainModelController(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        [HttpPost]
        public async Task<IActionResult> TrainModel([FromBody] TrainModelRequest request)
        {
            try
            {
                // Prepare request payload for FastAPI
                var payload = new
                {
                    trainStart = request.TrainStart,
                    trainEnd = request.TrainEnd,
                    testStart = request.TestStart,
                    testEnd = request.TestEnd
                };

                var jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                // URL from config or hardcoded
                var mlServiceUrl = _config["MLService:BaseUrl"] ?? "http://mlservice:8000";
                var response = await _httpClient.PostAsync($"{mlServiceUrl}/train-model", content);

                if (!response.IsSuccessStatusCode)
                {
                    var errorDetails = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, new { error = errorDetails });
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine(responseContent);
                var modelResult = JsonSerializer.Deserialize<TrainModelResponse>(responseContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    MaxDepth = 64
                });

                return Ok(modelResult);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Training failed: {ex.Message}" });
            }
        }
    }

}
