using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Controllers
{
    [Route("api/HouseholdUser")]
    [ApiController]
    public class HouseholdUserController : ControllerBase
    {
        HouseHoldUserRepository _repo;
        public HouseholdUserController()
        {
            _repo = new HouseHoldUserRepository();
        }

        [HttpGet("{id}")]
        public IActionResult GetHouseHoldUserById(int id)
        {
            return Ok(_repo.GetHouseHoldUserById(id));
        }

        [HttpGet("UserHousehold/{id}")]
        public IActionResult GetUsersInUsersHouseHold(string id)
        {
            var usersInHousehold = _repo.GetUsersInUsersHouseHold(id);

            if (usersInHousehold == null)
            {
                return NotFound("This User does not belong to any households");
            }
            return Ok(usersInHousehold);
        }

        [HttpGet("GetHouseId/{id}")]
        public IActionResult GetHouseHoldIdUserId(string id)
        {
            var householdId = _repo.GetHouseHoldIdUserId(id);

            if (householdId == null)
            {
                return NotFound("This User does not belong to any households");
            }
            return Ok(householdId);
        }



        [HttpGet("user/{id}")]
        public IActionResult GetHouseholdUserByUserId(int id)
        {
            var household = _repo.GetHouseHoldUserByUserId(id);
            if (household == null)
            {
                return NotFound("No household exists for this user id");
            }
            return Ok(household);
        }

        [HttpPost]
        public IActionResult AddAHouseHoldUser(HouseholdUser householduser)
        {
            _repo.AddAHouseHoldUser(householduser);
            return Created($"api/HouseholdUser/{householduser.Id}", householduser);
        }

        [HttpPatch("{id}")]
        public IActionResult ConfirmHouseHoldUser(HouseholdUser householduser)
        {
            _repo.ConfirmHouseHoldUser(householduser);
            return NoContent();
        }

        [HttpPatch("{id}")]
        public IActionResult DeleteHouseholdUser(HouseholdUser householduser)
        {
            _repo.DeleteHouseHoldUser(householduser);
            return NoContent();
        }
    }
}
