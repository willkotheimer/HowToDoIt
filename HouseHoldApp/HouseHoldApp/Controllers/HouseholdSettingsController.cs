using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Controllers
{
    [Route("api/HouseholdSettings")]
    [ApiController]
    public class HouseholdSettingsController : ControllerBase
    {
        private readonly HouseholdSettingsRepository _repo;

        public HouseholdSettingsController(HouseholdSettingsRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("{householdId}")]
        public IActionResult Get(int householdId)
        {
            var settings = _repo.GetByHouseholdId(householdId);
            return settings == null ? NotFound() : Ok(settings);
        }

        [HttpPatch]
        public IActionResult Update(HouseholdSettings settings)
        {
            _repo.Update(settings);
            return NoContent();
        }
    }
}
