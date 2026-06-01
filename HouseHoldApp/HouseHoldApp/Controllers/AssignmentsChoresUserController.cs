using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;

namespace HouseHoldApp.Controllers
{
    [Route("api/AssignmentsChoresUser")]
    [ApiController]
    public class AssignmentsChoresUserController : ControllerBase
    {
        private readonly AssignmentsChoresUserRepository _repo;

        public AssignmentsChoresUserController(AssignmentsChoresUserRepository repo)
        {
            _repo = repo;
        }

        [HttpGet("household/user/{id}")]
        public IActionResult GetAssignmentChoresUserByFirebaseKey(int id)
        {
            var assignmentList = _repo.GetAssignmentChoresUserById(id);

            if (assignmentList == null)
            {
                return NotFound("This user does not exist");
            }

            return Ok(assignmentList);
        }

    }
}
