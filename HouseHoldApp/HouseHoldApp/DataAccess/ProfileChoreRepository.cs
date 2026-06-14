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

        // If the chore already belongs to another profile it is moved here automatically.
        public void Add(ProfileChore profileChore)
        {
            var existing = _context.ProfileChores
                .FirstOrDefault(pc => pc.ChoreId == profileChore.ChoreId);
            if (existing != null)
                _context.ProfileChores.Remove(existing);

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
    }
}
