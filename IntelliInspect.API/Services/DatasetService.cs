using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using IntelliInspect.API.Models;
namespace IntelliInspect.API.Services
{
    public class DatasetService
    {
        private readonly string _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "TempFiles");

        public DatasetService()
        {
            Directory.CreateDirectory(_storagePath);
        }

        public async Task<DatasetMetadata> ProcessDatasetAsync(IFormFile file)
        {
            if (!file.FileName.EndsWith(".csv"))
                throw new Exception("Only CSV files are allowed.");

            var filePath = Path.Combine(_storagePath, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            List<dynamic> records;
            List<string> header;

            // Read CSV
            using (var reader = new StreamReader(filePath))
            using (var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture) { DetectColumnCountChanges = true }))
            {
                records = csv.GetRecords<dynamic>().ToList();
                if (records.Count == 0)
                    throw new Exception("CSV is empty.");

                header = ((IDictionary<string, object>)records[0]).Keys.ToList();

                if (!header.Contains("Response"))
                    throw new Exception("Missing 'Response' column.");
            }

            // Add synthetic timestamp if missing
            bool addedTimestamp = false;
            if (!header.Contains("synthetic_timestamp"))
            {
                DateTime baseTime = new DateTime(2021, 1, 1, 0, 0, 0);
                for (int i = 0; i < records.Count; i++)
                {
                    ((IDictionary<string, object>)records[i])["synthetic_timestamp"] = baseTime.AddSeconds(i).ToString("yyyy-MM-dd HH:mm:ss");
                }
                addedTimestamp = true;
            }

            // If synthetic timestamp was added, save updated CSV
            if (addedTimestamp)
            {
                using (var writer = new StreamWriter(filePath))
                using (var csvWriter = new CsvWriter(writer, CultureInfo.InvariantCulture))
                {
                    // Get updated header (including synthetic_timestamp)
                    var updatedHeader = ((IDictionary<string, object>)records[0]).Keys;
                    foreach (var h in updatedHeader)
                    {
                        csvWriter.WriteField(h);
                    }
                    csvWriter.NextRecord();

                    foreach (var row in records)
                    {
                        var dict = (IDictionary<string, object>)row;
                        foreach (var h in updatedHeader)
                        {
                            // write out the field, empty if missing (shouldn't be for our logic)
                            csvWriter.WriteField(dict.ContainsKey(h) ? dict[h] : "");
                        }
                        csvWriter.NextRecord();
                    }
                }
            }

            int passCount = 0;
            DateTime firstTime = DateTime.MaxValue;
            DateTime lastTime = DateTime.MinValue;

            foreach (var record in records)
            {
                var dict = (IDictionary<string, object>)record;

                if (dict["Response"].ToString() == "0")
                    passCount++;

                var ts = DateTime.Parse(dict["synthetic_timestamp"].ToString());
                if (ts < firstTime) firstTime = ts;
                if (ts > lastTime) lastTime = ts;
            }

            return new DatasetMetadata
            {
                FileName = file.FileName,
                TotalRows = records.Count,
                TotalColumns = ((IDictionary<string, object>)records[0]).Count,
                PassRate = Math.Round((double)passCount / records.Count * 100, 2),
                StartTimestamp = firstTime,
                EndTimestamp = lastTime
            };
        }

    }
}