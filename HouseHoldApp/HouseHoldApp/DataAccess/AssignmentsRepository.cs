using System.Collections.Generic;
using System.Linq;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class AssignmentsRepository
    {
        private readonly HouseholdContext _context;

        public AssignmentsRepository(HouseholdContext context)
        {
            _context = context;
        }

        public List<Assignments> GetAllAssignments()
        {
            return _context.Assignments.OrderByDescending(a => a.Week).ToList();
        }

        public List<Assignments> GetAllAssignmentsOfWeek(int week)
        {
            return _context.Assignments
                .Where(a => a.Week == week)
                .OrderByDescending(a => a.Week)
                .ToList();
        }

        public List<Assignments> GetAllAssignmentsOfUser(int userId)
        {
            return _context.Assignments
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Week)
                .ToList();
        }

        public Assignments GetAssignmentById(int id)
        {
            return _context.Assignments.FirstOrDefault(a => a.Id == id);
        }

        public void AddAnAssignment(Assignments assignment)
        {
            _context.Assignments.Add(assignment);
            _context.SaveChanges();
        }

        public void SetAssignmentDone(Assignments assignment)
        {
            var existing = _context.Assignments.FirstOrDefault(a => a.Id == assignment.Id);
            if (existing != null)
            {
                existing.UserId = assignment.UserId;
                existing.Week = assignment.Week;
                existing.IsCompleted = true;
                existing.Rating = assignment.Rating;
                existing.ChoreId = assignment.ChoreId;
                _context.SaveChanges();
            }
        }

        public void UpdateAssignment(Assignments assignment)
        {
            var existing = _context.Assignments.FirstOrDefault(a => a.Id == assignment.Id);
            if (existing != null)
            {
                existing.UserId = assignment.UserId;
                existing.Week = assignment.Week;
                existing.IsCompleted = assignment.IsCompleted;
                existing.Rating = assignment.Rating;
                existing.ChoreId = assignment.ChoreId;
                _context.SaveChanges();
            }
        }
    }
}
