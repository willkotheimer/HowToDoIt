using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Controllers
{
    [Route("api/Profiles")]
    [ApiController]
    public class ProfilesController : ControllerBase
    {
        private readonly ProfileRepository _repo;

        public ProfilesController(ProfileRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("household/{householdId}")]
        public IActionResult GetByHousehold(int householdId)
            => Ok(_repo.GetByHouseholdId(householdId));

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var profile = _repo.GetById(id);
            return profile == null ? NotFound() : Ok(profile);
        }

        [HttpPost]
        public IActionResult Create(Profile profile)
        {
            _repo.Add(profile);
            return Created($"api/Profiles/{profile.Id}", profile);
        }

        [HttpPatch]
        public IActionResult Update(Profile profile)
        {
            _repo.Update(profile);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _repo.Delete(id);
            return NoContent();
        }
    }
}
