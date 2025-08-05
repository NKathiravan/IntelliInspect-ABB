using Microsoft.AspNetCore.Mvc;
using IntelliInspect.API.Services;
using IntelliInspect.API.Models;
using System.IO;

[ApiController]
[Route("api/[controller]")]
[RequestSizeLimit(10_000_000_000)]
public class DatasetController : ControllerBase
{
    private readonly DatasetService _datasetService = new DatasetService();

    public DatasetController()
    {
        _datasetService = new DatasetService();
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadDataset(IFormFile file)
    {
        try
        {
            var metadata = await _datasetService.ProcessDatasetAsync(file);
            return Ok(metadata);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
    private readonly string datasetPath = Path.Combine(Directory.GetCurrentDirectory(), "TempFiles", "dataset.csv");

    [HttpGet("download")]
    public IActionResult DownloadDataset()
    {
        if (!System.IO.File.Exists(datasetPath))
        {
            return NotFound("Dataset file not found.");
        }

        var stream = new FileStream(datasetPath, FileMode.Open, FileAccess.Read);
        return File(stream, "text/csv", "dataset.csv");
    }

}
