using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using HouseHoldApp.DataAccess;

namespace HouseHoldApp.Controllers
{
    [Route("api/AssignmentsChores")]
    [ApiController]
    public class AssignmentsChoresController : ControllerBase
    {
        private readonly AssignmentsChoresRepository _repo;

        public AssignmentsChoresController(AssignmentsChoresRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("playbook/{id}")]
        public async Task<IActionResult> GetAssignmentsByHouseHoldId(int id)
        {
            var assignmentList = await _repo.GetAssignmentChoresByHouseholdIdAsync(id);

            if (assignmentList == null)
            {
                return NotFound("No assignments found for this household");
            }

            return Ok(assignmentList);
        }
    }
}
