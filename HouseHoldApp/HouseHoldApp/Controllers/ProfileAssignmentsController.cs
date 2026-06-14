using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Controllers
{
    [Route("api/ProfileAssignments")]
    [ApiController]
    public class ProfileAssignmentsController : ControllerBase
    {
        private readonly ProfileAssignmentRepository _repo;

        public ProfileAssignmentsController(ProfileAssignmentRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("household/{householdId}/week/{week}")]
        public IActionResult GetByHouseholdAndWeek(int householdId, int week)
            => Ok(_repo.GetByHouseholdAndWeek(householdId, week));

        [HttpGet("user/{userId}")]
        public IActionResult GetByUser(int userId)
            => Ok(_repo.GetByUserId(userId));

        [HttpPost]
        public IActionResult Create(ProfileAssignment pa)
        {
            _repo.Add(pa);
            return Created($"api/ProfileAssignments/{pa.Id}", pa);
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _repo.Delete(id);
            return NoContent();
        }

        [HttpPost("rollover")]
        public IActionResult Rollover([FromBody] RolloverRequest request)
        {
            _repo.RolloverWeek(request.HouseholdId, request.FromWeek, request.ToWeek);
            return NoContent();
        }
    }

    public class RolloverRequest
    {
        public int HouseholdId { get; set; }
        public int FromWeek { get; set; }
        public int ToWeek { get; set; }
    }
}
