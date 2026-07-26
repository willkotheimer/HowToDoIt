using System.Threading.Tasks;
using HowToDoItApp.DataAccess;
using HowToDoItApp.Models;
using HowToDoItApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace HowToDoItApp.Controllers
{
    [Route("api/WorkSteps")]
    [ApiController]
    public class WorkStepsController : ControllerBase
    {
        private readonly WorkStepRepository _repo;
        private readonly StepImageRepository _imageRepo;
        private readonly IBlobStorageService _blobStorage;

        public WorkStepsController(
            WorkStepRepository repo,
            StepImageRepository imageRepo,
            IBlobStorageService blobStorage)
        {
            _repo = repo;
            _imageRepo = imageRepo;
            _blobStorage = blobStorage;
        }

        // Ordered steps (with images) for a sequence (anonymous).
        [HttpGet("sequence/{sequenceId}")]
        public IActionResult GetBySequence(int sequenceId)
        {
            return Ok(_repo.GetBySequenceId(sequenceId));
        }

        [HttpPost]
        public IActionResult Create(WorkStep step)
        {
            var created = _repo.Add(step);
            return Created($"api/WorkSteps/{created.Id}", created);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, WorkStep step)
        {
            step.Id = id;
            _repo.Update(step);
            return NoContent();
        }

        [HttpPatch("order")]
        public IActionResult UpdateOrder(ReorderRequest request)
        {
            if (request?.Ids == null || request.Ids.Length == 0)
            {
                return BadRequest("No step order was provided.");
            }
            _repo.UpdateStepOrder(request.Ids);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // Purge the step's image blobs before the rows cascade away.
            var images = _imageRepo.GetByStepId(id);
            _repo.Delete(id);
            foreach (var image in images)
            {
                await _blobStorage.DeleteAsync(image.ImageUrl);
            }
            return NoContent();
        }
    }
}
