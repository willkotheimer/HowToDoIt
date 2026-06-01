using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Controllers
{
    [Route("api/Chores")]
    [ApiController]
    public class ChoresController : ControllerBase
    {
        private readonly ChoresRepository _repo;

        public ChoresController(ChoresRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public IActionResult GetAllChores()
        {
            return Ok(_repo.GetAllChores());
        }


        [HttpGet("{id}")]
        public IActionResult GetChoreById(int id)
        {
            var Chore = _repo.GetChoreById(id);

            if (Chore == null)
            {
                return NotFound("This Chore does not exist");
            }
            return Ok(Chore);
        }

         [HttpGet("household/{id}/{week}/unassigned")]
        public IActionResult GetUnassignedChoreByWeek(int id, int week)
        {
            var Chore = _repo.GetUnassignedChoreByWeek(id, week);
            if (Chore == null)
            {
                return NotFound("This Chore does not exist");
            }
            return Ok(Chore);
        }
        [HttpGet("household/{id}")]
        public IActionResult GetChoreByHouseholdId(int id)
        {
            var Chore = _repo.GetChoreByHouseholdId(id);
            if(Chore == null)
            {
                return NotFound("This Chore does not exist");
            }
            return Ok(Chore);
        }


        [HttpPost]
        public IActionResult AddAnChore(Chores Chore)
        {
            _repo.AddAChore(Chore);
            return Created($"api/Chores/{Chore.Id}", Chore);
        }

        [HttpPatch]
        public IActionResult UpdateChore(Chores Chore)
        {
            _repo.Updatechore(Chore);
            return NoContent();
        }
    }
}
