using System.Collections.Generic;
using System.Linq;
using HouseHoldApp.Models;
using Microsoft.EntityFrameworkCore;

namespace HouseHoldApp.DataAccess
{
    public class AssignmentsChoresUserRepository
    {
        private readonly HouseholdContext _context;

        public AssignmentsChoresUserRepository(HouseholdContext context)
        {
            _context = context;
        }

        public List<AssignmentsChoresUser> GetAssignmentChoresUserById(int id)
        {
            var householdId = _context.HouseHoldUsers
                .Where(hu => hu.UserId == id)
                .Select(hu => hu.HouseholdId)
                .FirstOrDefault();

            var householdUserIds = _context.HouseHoldUsers
                .Where(hu => hu.HouseholdId == householdId)
                .Select(hu => hu.UserId)
                .ToList();

            var assignments = _context.Assignments
                .Include(a => a.Chore)
                .Where(a => householdUserIds.Contains(a.UserId))
                .ToList()
                .Where(a => a.Chore != null)
                .ToList();

            var users = _context.Users
                .Where(u => householdUserIds.Contains(u.Id))
                .ToDictionary(u => u.Id);

            var categoryIds = assignments.Select(a => a.Chore.Category).Distinct().ToList();
            var categories = _context.Categories
                .Where(c => categoryIds.Contains(c.Id))
                .ToDictionary(c => c.Id);

            return assignments
                .Where(a => users.ContainsKey(a.UserId) && categories.ContainsKey(a.Chore.Category))
                .Select(a => new AssignmentsChoresUser
                {
                    Firstname = users[a.UserId].Firstname,
                    Lastname = users[a.UserId].Lastname,
                    FirebaseKey = users[a.UserId].FirebaseKey,
                    userId = a.UserId.ToString(),
                    Week = a.Week,
                    isCompleted = a.IsCompleted,
                    Rating = a.Rating,
                    choreId = a.Chore.Id,
                    assignmentId = a.Id,
                    Chorename = a.Chore.Name,
                    ChoreDescription = a.Chore.Description,
                    HouseHoldId = householdId,
                    CategoryName = categories[a.Chore.Category].CategoryName
                })
                .OrderBy(x => x.CategoryName)
                .ThenBy(x => x.choreId)
                .ToList();
        }
    }
}
