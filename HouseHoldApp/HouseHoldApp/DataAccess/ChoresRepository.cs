using System.Collections.Generic;
using System.Linq;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class ChoresRepository
    {
        private readonly HouseholdContext _context;

        public ChoresRepository(HouseholdContext context)
        {
            _context = context;
        }

        public List<Chores> GetAllChores()
        {
            return _context.Chores.OrderByDescending(c => c.Name).ToList();
        }

        public Chores GetChoreById(int id)
        {
            return _context.Chores.FirstOrDefault(c => c.Id == id);
        }

        public List<Chores> GetUnassignedChoreByWeek(int hhi, int week)
        {
            var assignedChoreIds = _context.Assignments
                .Where(a => a.Week == week)
                .Join(_context.Chores.Where(c => c.HouseHoldId == hhi),
                      a => a.ChoreId,
                      c => c.Id,
                      (a, c) => c.Id)
                .ToHashSet();

            return _context.Chores
                .Where(c => !assignedChoreIds.Contains(c.Id))
                .ToList();
        }

        public List<Chores> GetChoreByHouseholdId(int id)
        {
            return _context.Chores.Where(c => c.HouseHoldId == id).ToList();
        }

        public void AddAChore(Chores chore)
        {
            _context.Chores.Add(chore);
            _context.SaveChanges();
        }

        public void Updatechore(Chores chore)
        {
            var existing = _context.Chores.FirstOrDefault(c => c.Id == chore.Id);
            if (existing != null)
            {
                existing.Name = chore.Name;
                existing.Category = chore.Category;
                existing.Description = chore.Description;
                _context.SaveChanges();
            }
        }
    }
}
