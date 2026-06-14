using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class ProfileAssignmentRepository
    {
        private readonly HouseholdContext _context;

        public ProfileAssignmentRepository(HouseholdContext context)
        {
            _context = context;
        }

        public List<ProfileAssignment> GetByHouseholdAndWeek(int householdId, int week)
        {
            return _context.ProfileAssignments
                .Include(pa => pa.Profile)
                .Where(pa => pa.HouseholdId == householdId && pa.Week == week)
                .ToList();
        }

        public List<ProfileAssignment> GetByUserId(int userId)
        {
            return _context.ProfileAssignments
                .Include(pa => pa.Profile)
                .Where(pa => pa.UserId == userId)
                .OrderByDescending(pa => pa.Week)
                .ToList();
        }

        public void Add(ProfileAssignment pa)
        {
            _context.ProfileAssignments.Add(pa);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var pa = _context.ProfileAssignments.FirstOrDefault(x => x.Id == id);
            if (pa != null)
            {
                _context.ProfileAssignments.Remove(pa);
                _context.SaveChanges();
            }
        }

        public void RolloverWeek(int householdId, int fromWeek, int toWeek)
        {
            var settings = _context.HouseholdSettings
                .FirstOrDefault(s => s.HouseholdId == householdId);
            if (settings == null || !settings.RolloverEnabled) return;

            // Don't duplicate if this week already has assignments
            if (_context.ProfileAssignments.Any(pa => pa.HouseholdId == householdId && pa.Week == toWeek))
                return;

            var previous = _context.ProfileAssignments
                .Where(pa => pa.HouseholdId == householdId && pa.Week == fromWeek)
                .ToList();

            foreach (var pa in previous)
            {
                _context.ProfileAssignments.Add(new ProfileAssignment
                {
                    ProfileId = pa.ProfileId,
                    UserId = pa.UserId,
                    Week = toWeek,
                    HouseholdId = pa.HouseholdId
                });
            }

            _context.SaveChanges();
        }
    }
}
