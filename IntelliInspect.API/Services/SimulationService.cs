using IntelliInspect.API.Models;
using CsvHelper;
using System.Net.Http.Json;
using System.Globalization;

namespace IntelliInspect.API.Services
{
    public class SimulationService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public SimulationService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public async IAsyncEnumerable<SimulationResult> SimulateAsync(DateTime start, DateTime end)
        {
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "TempFiles", "dataset.csv");

            if (!File.Exists(filePath))
                yield break;

            using var reader = new StreamReader(filePath);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
            var records = csv.GetRecords<dynamic>();

            foreach (var record in records)
            {
                DateTime timestamp;
                if (!DateTime.TryParse(record.synthetic_timestamp?.ToString(), out timestamp))
                    continue;

                if (timestamp < start || timestamp > end)
                    continue;

                var sampleId = record.Id?.ToString() ?? Guid.NewGuid().ToString();

                var httpClient = _httpClientFactory.CreateClient();
                var mlEndpoint = _configuration["MLService:PredictionUrl"];

                var response = await httpClient.PostAsJsonAsync(mlEndpoint,(object) record);
                if (!response.IsSuccessStatusCode)
                    continue;

                var result = await response.Content.ReadFromJsonAsync<SimulationResult>();
                result!.SampleId = sampleId;
                result.Timestamp = timestamp;

                yield return result;

                await Task.Delay(1000); // Emit 1 row/second
            }
        }
    }
}
