using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Controllers
{
    [Route("api/Household")]
    [ApiController]
    public class HouseholdController : ControllerBase
    {
        private readonly HouseholdRepository _repo;

        public HouseholdController(HouseholdRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public IActionResult GetHouseHolds()
        {
            return Ok(_repo.GetAllHouseholds());
        }

        [HttpGet("{id}")]
        public IActionResult GetHouseholdById(int id)
        {
            return Ok(_repo.GetHouseholdById(id));
        }

        [HttpPost]
        public IActionResult AddAHousehold(Household HouseHold)
        {
            _repo.AddAHousehold(HouseHold);
            return Created($"api/HouseHold/{HouseHold.Id}", HouseHold);
        }

        [HttpPatch]
        public IActionResult UpdateHousehold(Household HouseHold)
        {
            _repo.UpdateHousehold(HouseHold);
            return NoContent();
        }
    }
}
