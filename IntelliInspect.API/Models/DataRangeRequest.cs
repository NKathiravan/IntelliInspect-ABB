namespace IntelliInspect.API.Models
{
	public class DateRange
	{
		public DateTime Start { get; set; }
		public DateTime End { get; set; }
	}

	public class DateRangeRequest
	{
		public DateRange Training { get; set; }
		public DateRange Testing { get; set; }
		public DateRange Simulation { get; set; }
	}
}
