using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;
using HouseHoldApp.Services;

namespace HouseHoldApp.Controllers
{
    [Route("api/Images")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly ImagesRepository _repo;
        private readonly IBlobStorageService _blobStorage;

        public ImagesController(ImagesRepository repo, IBlobStorageService blobStorage)
        {
            _repo = repo;
            _blobStorage = blobStorage;
        }

        [HttpGet]
        public IActionResult GetAllImages()
        {
            return Ok(_repo.GetAllImages());
        }

        [HttpGet("{id}")]
        public IActionResult GetImagesByChoreId(int id)
        {
            var images = _repo.GetImageByChoreId(id);
            if (images == null)
            {
                return NotFound("No images exists for this chore");
            }
            return Ok(images);
        }

        [HttpGet("oneperchore")]
        public IActionResult GetOneImagePerChoreId() {
            var image = _repo.GetOneImagePerChoreId();
            if (image == null) {
                return NotFound("No images exists for this chore");
            }
            return Ok(image);
        }

        [HttpPost]
        public IActionResult AddAnImage(Images image)
        {
            _repo.AddAnImage(image);
            return Created($"api/Images/{image.Id}", image);
        }

        [HttpPost("upload")]
        [RequestSizeLimit(20 * 1024 * 1024)]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromForm] int choreId)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file was provided.");
            }
            if (choreId <= 0)
            {
                return BadRequest("A valid choreId is required.");
            }

            using var stream = file.OpenReadStream();
            var url = await _blobStorage.UploadAsync(stream, file.FileName, file.ContentType, choreId);

            var image = new Images { Image = url, ChoreId = choreId, Active = 1 };
            _repo.AddAnImage(image);

            return Created($"api/Images/{image.Id}", image);
        }

        [HttpDelete("{imageId}")]
        public async Task<IActionResult> DeleteImage(int imageId)
        {
            var image = _repo.GetImageById(imageId);
            _repo.DeleteImage(imageId);
            if (image != null)
            {
                await _blobStorage.DeleteAsync(image.Image);
            }
            return Ok(200);
        }
    }
}
