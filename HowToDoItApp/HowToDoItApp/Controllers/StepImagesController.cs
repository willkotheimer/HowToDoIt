using System.Threading.Tasks;
using HowToDoItApp.DataAccess;
using HowToDoItApp.Models;
using HowToDoItApp.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HowToDoItApp.Controllers
{
    [Route("api/StepImages")]
    [ApiController]
    public class StepImagesController : ControllerBase
    {
        private readonly StepImageRepository _repo;
        private readonly IBlobStorageService _blobStorage;

        public StepImagesController(StepImageRepository repo, IBlobStorageService blobStorage)
        {
            _repo = repo;
            _blobStorage = blobStorage;
        }

        // Ordered images for a step (anonymous).
        [HttpGet("step/{stepId}")]
        public IActionResult GetByStep(int stepId)
        {
            return Ok(_repo.GetByStepId(stepId));
        }

        [HttpPost("upload")]
        [RequestSizeLimit(20 * 1024 * 1024)]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] int stepId)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file was provided.");
            }
            if (stepId <= 0)
            {
                return BadRequest("A valid stepId is required.");
            }

            using var stream = file.OpenReadStream();
            var url = await _blobStorage.UploadAsync(stream, file.FileName, file.ContentType, stepId);

            var image = _repo.Add(new StepImage { ImageUrl = url, WorkStepId = stepId, Active = 1 });
            return Created($"api/StepImages/{image.Id}", image);
        }

        [HttpPatch("order")]
        public IActionResult UpdateOrder(ReorderRequest request)
        {
            if (request?.Ids == null || request.Ids.Length == 0)
            {
                return BadRequest("No image order was provided.");
            }
            _repo.UpdateImageOrder(request.Ids);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var image = _repo.GetById(id);
            _repo.Delete(id);
            if (image != null)
            {
                await _blobStorage.DeleteAsync(image.ImageUrl);
            }
            return NoContent();
        }
    }
}
