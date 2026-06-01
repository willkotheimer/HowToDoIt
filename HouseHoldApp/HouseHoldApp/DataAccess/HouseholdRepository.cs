using System.Collections.Generic;
using System.Linq;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class HouseholdRepository
    {
        private readonly HouseholdContext _context;

        public HouseholdRepository(HouseholdContext context)
        {
            _context = context;
        }

        public List<Household> GetAllHouseholds()
        {
            return _context.Households.OrderByDescending(h => h.Name).ToList();
        }

        public Household GetHouseholdById(int id)
        {
            return _context.Households.FirstOrDefault(h => h.Id == id);
        }

        public void AddAHousehold(Household household)
        {
            _context.Households.Add(household);
            _context.SaveChanges();
        }

        public void UpdateHousehold(Household household)
        {
            var existing = _context.Households.FirstOrDefault(h => h.Id == household.Id);
            if (existing != null)
            {
                existing.Name = household.Name;
                _context.SaveChanges();
            }
        }
    }
}
