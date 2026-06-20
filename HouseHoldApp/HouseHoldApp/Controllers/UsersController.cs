using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Controllers
{
    [Route("api/Users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly UserRepository _repo;

        public UserController(UserRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public IActionResult GetAllUsers()
        {
            return Ok(_repo.GetAllUsers());
        }

        [HttpGet("{id}")]
        public IActionResult GetUserById(int id)
        {
            var user = _repo.GetUserById(id);

            if (user == null)
            {
                return NotFound("This User does not exist");
            }
            return Ok(user);
        }

        [HttpGet("fbKey/{firebaseKey}")]
        public IActionResult GetUserByFirebaseKey(string firebaseKey)
        {
            var user = _repo.GetUserByFirebaseKey(firebaseKey);

            if (user == null)
            {
                return NotFound("This User does not exist");
            }
            return Ok(user);
        }

        [HttpGet("email/{email}")]
        public IActionResult GetUserByEmail(string email)
        {
            var user = _repo.GetUserByEmail(email);

            if (user == null)
            {
                return NotFound("This User does not exist");
            }
            return Ok(user);
        }

        [HttpGet("UserHousehold/{id}")]
        public IActionResult GetUsersInUsersHouseHold(int id)
        {
            var usersInHousehold = _repo.GetUsersInUsersHouseHold(id);

            if (usersInHousehold == null)
            {
                return NotFound("This User does not belong to any households");
            }
            return Ok(usersInHousehold);
        }

        [HttpPost]
        public IActionResult AddAUser(Users user)
        {
            _repo.AddAUser(user);
            return Created($"api/User/{user.Id}", user);
        }

        [HttpPatch]
        public IActionResult UpdateUser(Users user)
        {
            _repo.UpdateUser(user);
            return NoContent();
        }

        // Re-links an existing user record to the caller's Entra object id.
        // Protected by the global write filter (requires a valid token).
        [HttpPatch("link")]
        public IActionResult LinkUser(LinkUserRequest request)
        {
            _repo.LinkFirebaseKey(request.Id, request.FirebaseKey);
            return NoContent();
        }
    }
}
