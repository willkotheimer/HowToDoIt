using System.Threading.Tasks;
using HowToDoItApp.DataAccess;
using HowToDoItApp.Models;
using HowToDoItApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace HowToDoItApp.Controllers
{
    [Route("api/WorkSequences")]
    [ApiController]
    public class WorkSequencesController : ControllerBase
    {
        private readonly WorkSequenceRepository _repo;
        private readonly IBlobStorageService _blobStorage;

        public WorkSequencesController(WorkSequenceRepository repo, IBlobStorageService blobStorage)
        {
            _repo = repo;
            _blobStorage = blobStorage;
        }

        // Public feed listing (anonymous). Lightweight: no steps/images.
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_repo.GetAll());
        }

        // Full detail with ordered steps and images (anonymous).
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var sequence = _repo.GetById(id);
            if (sequence == null)
            {
                return NotFound("No work sequence exists with that id.");
            }
            return Ok(sequence);
        }

        [HttpPost]
        public IActionResult Create(WorkSequence sequence)
        {
            var created = _repo.Add(sequence);
            return Created($"api/WorkSequences/{created.Id}", created);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, WorkSequence sequence)
        {
            sequence.Id = id;
            _repo.Update(sequence);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // Grab the blob URLs before the image rows cascade away, then delete
            // the sequence (steps + images cascade), then purge the blobs.
            var imageUrls = _repo.GetImageUrls(id);
            _repo.Delete(id);
            foreach (var url in imageUrls)
            {
                await _blobStorage.DeleteAsync(url);
            }
            return NoContent();
        }
    }
}
