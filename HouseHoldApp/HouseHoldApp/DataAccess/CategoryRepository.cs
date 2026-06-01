using System.Collections.Generic;
using System.Linq;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class CategoryRepository
    {
        private readonly HouseholdContext _context;

        public CategoryRepository(HouseholdContext context)
        {
            _context = context;
        }

        public List<Category> GetAllCategories()
        {
            return _context.Categories.ToList();
        }
    }
}
