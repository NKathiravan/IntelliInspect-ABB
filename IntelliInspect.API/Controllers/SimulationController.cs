//using IntelliInspect.API.Models;
//using IntelliInspect.API.Services;
//using Microsoft.AspNetCore.Mvc;
//using System.Net.Http.Json;


//namespace IntelliInspect.API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class SimulationController : ControllerBase
//    {
//        private readonly SimulationService _simulationService;

//        public SimulationController(SimulationService simulationService)
//        {
//            _simulationService = simulationService;
//        }

//        [HttpPost("start")]
//        public async Task StartSimulation([FromBody] SimulationRequest request)
//        {
//            Response.ContentType = "text/event-stream";

//            await foreach (var result in _simulationService.SimulateAsync(request.StartDate, request.EndDate))
//            {
//                var json = System.Text.Json.JsonSerializer.Serialize(result);
//                await Response.WriteAsync($"data: {json}\n\n");
//                await Response.Body.FlushAsync();
//            }
//        }


//    [HttpPost("simulate")]
//        public async Task Simulate([FromBody] SimulationRequest request)
//        {
//            var fastApiUrl = _configuration["MLService:SimulationUrl"];

//            var httpRequest = new HttpRequestMessage(HttpMethod.Post, fastApiUrl)
//            {
//                Content = JsonContent.Create(request)
//            };

//            var fastApiResponse = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead);

//            fastApiResponse.EnsureSuccessStatusCode();

//            var responseStream = await fastApiResponse.Content.ReadAsStreamAsync();

//            Response.ContentType = "text/event-stream";

//            using var writer = new StreamWriter(Response.Body);
//            using var reader = new StreamReader(responseStream);

//            while (!reader.EndOfStream)
//            {
//                var line = await reader.ReadLineAsync();
//                if (!string.IsNullOrWhiteSpace(line))
//                {
//                    await writer.WriteLineAsync(line);
//                    await writer.FlushAsync();
//                }
//            }
//        }

//    }

//}

using IntelliInspect.API.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Json;

namespace IntelliInspect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SimulationController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public SimulationController(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        [HttpPost("start")]
        public async Task StartSimulation([FromBody] SimulationRequest request)
        {
            var fastApiUrl = _configuration["MLService:PredictionUrl"]; // should be like http://localhost:8000/simulate

            var httpRequest = new HttpRequestMessage(HttpMethod.Post, fastApiUrl)
            {
                Content = JsonContent.Create(request)
            };

            var fastApiResponse = await _httpClient.SendAsync(httpRequest, HttpCompletionOption.ResponseHeadersRead);

            fastApiResponse.EnsureSuccessStatusCode();

            var responseStream = await fastApiResponse.Content.ReadAsStreamAsync();

            Response.ContentType = "text/event-stream";

            using var writer = new StreamWriter(Response.Body);
            using var reader = new StreamReader(responseStream);

            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (!string.IsNullOrWhiteSpace(line))
                {
                    await writer.WriteLineAsync($"data: {line}\n");
                    await writer.WriteLineAsync(); // add newline for SSE
                    await writer.FlushAsync();
                }
            }
        }
    }
}
