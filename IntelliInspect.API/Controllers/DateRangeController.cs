using IntelliInspect.API.Models;
using IntelliInspect.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace IntelliInspect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DateRangeController : ControllerBase
    {
        private const string DatasetPath = "TempFiles/dataset.csv";  // Or store in-memory if preferred

        [HttpPost("validate")]
        public IActionResult ValidateDateRanges([FromBody] DateRangeRequest request)
        {
            if (!System.IO.File.Exists(DatasetPath))
                return BadRequest("Dataset not uploaded yet.");

            using var stream = System.IO.File.OpenRead(DatasetPath);
            var result = DateRangeValidator.Validate(stream, request);

            return Ok(result);
        }
    }
}
