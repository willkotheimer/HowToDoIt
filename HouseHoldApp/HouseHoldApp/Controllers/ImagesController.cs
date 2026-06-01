using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Controllers
{
    [Route("api/Images")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly ImagesRepository _repo;

        public ImagesController(ImagesRepository repo)
        {
            _repo = repo;
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

        [HttpDelete("{imageId}")]
        public IActionResult DeleteImage(int imageId)
        {
            _repo.DeleteImage(imageId);
            return Ok(200);
        }
    }
}
