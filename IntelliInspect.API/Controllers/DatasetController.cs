using Microsoft.AspNetCore.Mvc;
using IntelliInspect.API.Services;
using IntelliInspect.API.Models;

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

}
