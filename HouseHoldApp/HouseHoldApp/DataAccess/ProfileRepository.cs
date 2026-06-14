using System.Collections.Generic;
using System.Linq;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class ProfileRepository
    {
        private readonly HouseholdContext _context;

        public ProfileRepository(HouseholdContext context)
        {
            _context = context;
        }

        public List<Profile> GetByHouseholdId(int householdId)
        {
            return _context.Profiles
                .Where(p => p.HouseholdId == householdId)
                .OrderBy(p => p.Name)
                .ToList();
        }

        public Profile GetById(int id)
        {
            return _context.Profiles.FirstOrDefault(p => p.Id == id);
        }

        public void Add(Profile profile)
        {
            _context.Profiles.Add(profile);
            _context.SaveChanges();
        }

        public void Update(Profile profile)
        {
            var existing = _context.Profiles.FirstOrDefault(p => p.Id == profile.Id);
            if (existing != null)
            {
                existing.Name = profile.Name;
                _context.SaveChanges();
            }
        }

        public void Delete(int id)
        {
            var profile = _context.Profiles.FirstOrDefault(p => p.Id == id);
            if (profile != null)
            {
                _context.Profiles.Remove(profile);
                _context.SaveChanges();
            }
        }
    }
}
