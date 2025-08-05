using IntelliInspect.API.Models;
using CsvHelper;
using System.Globalization;

namespace IntelliInspect.API.Services
{
    public class DateRangeValidator
    {
        public static DateRangeValidationResult Validate(Stream datasetStream, DateRangeRequest request)
        {
            var result = new DateRangeValidationResult
            {
                Periods = new List<PeriodSummary>(),
                MonthlyCounts = new List<MonthlyBreakdown>()
            };

            // Load all CSV rows
            using var reader = new StreamReader(datasetStream);
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var rows = csv.GetRecords<dynamic>().ToList();
            var records = rows.Select(row =>
            {
                var dict = row as IDictionary<string, object>;
                DateTime timestamp = DateTime.Parse(dict["synthetic_timestamp"].ToString());
                return timestamp;
            }).ToList();

            if (records.Count == 0)
            {
                result.Status = "Invalid";
                result.Message = "Dataset is empty or timestamp column missing.";
                return result;
            }

            // Validate chronological and non-overlapping logic
            var train = request.Training;
            var test = request.Testing;
            var sim = request.Simulation;

            if (train.Start > train.End || test.Start > test.End || sim.Start > sim.End)
            {
                result.Status = "Invalid";
                result.Message = "Start date must be before or equal to end date.";
                return result;
            }

            if (test.Start <= train.End || sim.Start <= test.End)
            {
                result.Status = "Invalid";
                result.Message = "Date ranges must be sequential and non-overlapping.";
                return result;
            }

            var datasetMin = records.Min();
            var datasetMax = records.Max();

            if (train.Start < datasetMin || sim.End > datasetMax)
            {
                result.Status = "Invalid";
                result.Message = "Selected dates fall outside dataset range.";
                return result;
            }

            // Count records per period
            (string name, DateTime start, DateTime end)[] periods = {
                ("Training", train.Start, train.End),
                ("Testing", test.Start, test.End),
                ("Simulation", sim.Start, sim.End)
            };

            foreach (var (name, start, end) in periods)
            {
                var periodTimestamps = records.Where(ts => ts >= start && ts <= end).ToList();

                result.Periods.Add(new PeriodSummary
                {
                    Name = name,
                    DurationDays = (end - start).Days + 1,
                    RecordCount = periodTimestamps.Count,
                    Start = start,
                    End = end
                });

                var monthlyGroups = periodTimestamps.GroupBy(ts => ts.ToString("yyyy-MM"))
                    .Select(g => new MonthlyBreakdown
                    {
                        Month = g.Key,
                        Count = g.Count(),
                        RangeType = name
                    });

                result.MonthlyCounts.AddRange(monthlyGroups);
            }

            result.Status = "Valid";
            result.Message = "Date ranges validated successfully!";
            return result;
        }
    }
}
