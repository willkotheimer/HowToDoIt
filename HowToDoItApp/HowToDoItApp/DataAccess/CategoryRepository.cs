using System.Collections.Generic;
using System.Linq;
using HowToDoItApp.Models;

namespace HowToDoItApp.DataAccess
{
    public class CategoryRepository
    {
        private readonly HowToDoItContext _context;

        public CategoryRepository(HowToDoItContext context)
        {
            _context = context;
        }

        public List<Category> GetAllCategories()
        {
            return _context.Categories
                .OrderBy(c => c.CategoryName)
                .ToList();
        }

        public Category Add(Category category)
        {
            _context.Categories.Add(category);
            _context.SaveChanges();
            return category;
        }
    }
}
