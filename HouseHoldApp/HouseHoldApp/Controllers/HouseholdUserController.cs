using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Controllers
{
    [Route("api/HouseHoldUser")]
    [ApiController]
    public class HouseHoldUserController : ControllerBase
    {
        HouseHoldUserRepository _repo;
        public HouseHoldUserController(HouseHoldUserRepository repo)
        {
            _repo = repo;
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



        [HttpGet("Household/{id}")]
        public IActionResult GetUsersByHouseholdId(int id)
        {
            return Ok(_repo.GetUsersByHouseholdId(id));
        }

        [HttpGet("user/{id}")]
        public IActionResult GetHouseHoldUserByUserId(int id)
        {
            var household = _repo.GetHouseHoldUserByUserId(id);
            if (household == null)
            {
                return NotFound("No household exists for this user id");
            }
            return Ok(household);
        }

        [HttpPost]
        public IActionResult AddAHouseHoldUser(HouseHoldUser householduser)
        {
            _repo.AddAHouseHoldUser(householduser);
            return Created($"api/HouseHoldUser/{householduser.Id}", householduser);
        }

        [HttpPatch("{id}")]
        public IActionResult ConfirmHouseHoldUser(HouseHoldUser householduser)
        {
            _repo.ConfirmHouseHoldUser(householduser);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteHouseHoldUser(HouseHoldUser householduser)
        {
            _repo.DeleteHouseHoldUser(householduser);
            return NoContent();
        }
    }
}
