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
            // Dispatch the profile's chores as individual weekly assignments.
            CreateAssignmentsForProfile(pa.ProfileId, pa.UserId, pa.Week);
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var pa = _context.ProfileAssignments.FirstOrDefault(x => x.Id == id);
            if (pa != null)
            {
                // Remove the profile's not-yet-completed assignments for this week;
                // keep completed ones for the week's record.
                RemoveIncompleteAssignmentsForProfile(pa.ProfileId, pa.UserId, pa.Week);
                _context.ProfileAssignments.Remove(pa);
                _context.SaveChanges();
            }
        }

        // Create one Assignment per chore in the profile, skipping any chore the
        // user already has an assignment for that exact week (dedupe by ChoreId).
        // Caller is responsible for SaveChanges.
        private void CreateAssignmentsForProfile(int profileId, int userId, int week)
        {
            var choreIds = _context.ProfileChores
                .Where(pc => pc.ProfileId == profileId)
                .Select(pc => pc.ChoreId)
                .ToList();

            foreach (var choreId in choreIds)
            {
                var alreadyAssigned = _context.Assignments
                    .Any(a => a.UserId == userId && a.ChoreId == choreId && a.Week == week);
                if (!alreadyAssigned)
                {
                    _context.Assignments.Add(new Assignments
                    {
                        UserId = userId,
                        ChoreId = choreId,
                        Week = week,
                        IsCompleted = false,
                    });
                }
            }
        }

        private void RemoveIncompleteAssignmentsForProfile(int profileId, int userId, int week)
        {
            var choreIds = _context.ProfileChores
                .Where(pc => pc.ProfileId == profileId)
                .Select(pc => pc.ChoreId)
                .ToList();

            var toRemove = _context.Assignments
                .Where(a => a.UserId == userId
                    && a.Week == week
                    && choreIds.Contains(a.ChoreId)
                    && a.IsCompleted != true)
                .ToList();

            _context.Assignments.RemoveRange(toRemove);
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
                // Recreate the dispatched assignments for the new week.
                CreateAssignmentsForProfile(pa.ProfileId, pa.UserId, toWeek);
            }

            _context.SaveChanges();
        }
    }
}
