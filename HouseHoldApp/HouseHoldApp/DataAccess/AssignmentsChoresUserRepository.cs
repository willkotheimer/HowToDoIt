using System.Collections.Generic;
using System.Linq;
using HouseHoldApp.Models;

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

            return _context.Users
                .Join(_context.Assignments,
                      u => u.Id,
                      a => a.UserId,
                      (u, a) => new { u, a })
                .Join(_context.Chores,
                      x => x.a.ChoreId,
                      c => c.Id,
                      (x, c) => new { x.u, x.a, c })
                .Join(_context.Categories,
                      x => x.c.Category,
                      cat => cat.Id,
                      (x, cat) => new { x.u, x.a, x.c, cat })
                .Join(_context.HouseHoldUsers.Where(hu => hu.HouseholdId == householdId),
                      x => x.u.Id,
                      hu => hu.UserId,
                      (x, hu) => new AssignmentsChoresUser
                      {
                          Firstname = x.u.Firstname,
                          Lastname = x.u.Lastname,
                          FirebaseKey = x.u.FirebaseKey,
                          userId = x.a.UserId.ToString(),
                          Week = x.a.Week,
                          isCompleted = x.a.IsCompleted,
                          Rating = x.a.Rating,
                          choreId = x.c.Id,
                          assignmentId = x.a.Id,
                          Chorename = x.c.Name,
                          ChoreDescription = x.c.Description,
                          HouseHoldId = hu.HouseholdId,
                          CategoryName = x.cat.CategoryName
                      })
                .OrderBy(x => x.CategoryName)
                .ThenBy(x => x.choreId)
                .ToList();
        }
    }
}
