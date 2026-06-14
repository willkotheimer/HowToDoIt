using Microsoft.AspNetCore.Mvc;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Controllers
{
    [Route("api/ProfileChores")]
    [ApiController]
    public class ProfileChoresController : ControllerBase
    {
        private readonly ProfileChoreRepository _repo;
        private readonly ProfileRepository _profileRepo;
        private readonly HouseholdSettingsRepository _settingsRepo;

        public ProfileChoresController(
            ProfileChoreRepository repo,
            ProfileRepository profileRepo,
            HouseholdSettingsRepository settingsRepo)
        {
            _repo = repo;
            _profileRepo = profileRepo;
            _settingsRepo = settingsRepo;
        }

        [HttpGet("{profileId}")]
        public IActionResult GetByProfile(int profileId)
            => Ok(_repo.GetByProfileId(profileId));

        [HttpGet("unassigned/{householdId}")]
        public IActionResult GetUnassigned(int householdId)
            => Ok(_repo.GetUnassignedByHouseholdId(householdId));

        [HttpPost]
        public IActionResult Add(ProfileChore profileChore)
        {
            var profile = _profileRepo.GetById(profileChore.ProfileId);
            if (profile == null) return NotFound("Profile not found.");

            var settings = _settingsRepo.GetByHouseholdId(profile.HouseholdId);
            int maxChores = settings?.MaxChoresPerProfile ?? 10;
            int currentCount = _repo.GetByProfileId(profileChore.ProfileId).Count;

            // If the chore is already in this exact profile, allow (repo will no-op the move)
            bool alreadyHere = _repo.GetByProfileId(profileChore.ProfileId)
                .Exists(pc => pc.ChoreId == profileChore.ChoreId);

            if (!alreadyHere && currentCount >= maxChores)
                return BadRequest($"Profile is at its maximum of {maxChores} chores.");

            _repo.Add(profileChore);
            return Created($"api/ProfileChores/{profileChore.Id}", profileChore);
        }

        [HttpDelete("{id}")]
        public IActionResult Remove(int id)
        {
            _repo.Remove(id);
            return NoContent();
        }
    }
}
