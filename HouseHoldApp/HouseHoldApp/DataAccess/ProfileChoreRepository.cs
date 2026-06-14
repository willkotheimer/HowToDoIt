using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class ProfileChoreRepository
    {
        private readonly HouseholdContext _context;

        public ProfileChoreRepository(HouseholdContext context)
        {
            _context = context;
        }

        public List<ProfileChore> GetByProfileId(int profileId)
        {
            return _context.ProfileChores
                .Include(pc => pc.Chore)
                .Where(pc => pc.ProfileId == profileId)
                .ToList();
        }

        // Returns every profile this chore belongs to.
        public List<ProfileChore> GetByChoreId(int choreId)
        {
            return _context.ProfileChores
                .Where(pc => pc.ChoreId == choreId)
                .ToList();
        }

        // Chores that belong to no profile for this household.
        public List<Chores> GetUnassignedByHouseholdId(int householdId)
        {
            var assignedChoreIds = _context.ProfileChores
                .Select(pc => pc.ChoreId)
                .ToHashSet();

            return _context.Chores
                .Where(c => c.HouseHoldId == householdId && !assignedChoreIds.Contains(c.Id))
                .OrderBy(c => c.Name)
                .ToList();
        }

        // A chore may belong to multiple profiles — no uniqueness enforced here.
        public void Add(ProfileChore profileChore)
        {
            // Avoid inserting a duplicate (same chore already in this same profile).
            bool alreadyLinked = _context.ProfileChores.Any(
                pc => pc.ProfileId == profileChore.ProfileId && pc.ChoreId == profileChore.ChoreId);
            if (alreadyLinked) return;

            _context.ProfileChores.Add(profileChore);
            _context.SaveChanges();
        }

        public void Remove(int id)
        {
            var pc = _context.ProfileChores.FirstOrDefault(x => x.Id == id);
            if (pc != null)
            {
                _context.ProfileChores.Remove(pc);
                _context.SaveChanges();
            }
        }

        // Remove a specific chore from a specific profile (used by the task form).
        public void RemoveByChoreAndProfile(int choreId, int profileId)
        {
            var pc = _context.ProfileChores
                .FirstOrDefault(x => x.ChoreId == choreId && x.ProfileId == profileId);
            if (pc != null)
            {
                _context.ProfileChores.Remove(pc);
                _context.SaveChanges();
            }
        }
    }
}
