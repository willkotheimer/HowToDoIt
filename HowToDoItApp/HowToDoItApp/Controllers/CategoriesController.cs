using HowToDoItApp.DataAccess;
using HowToDoItApp.Models;
using Microsoft.AspNetCore.Mvc;

namespace HowToDoItApp.Controllers
{
    [Route("api/Categories")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryRepository _repo;

        public CategoriesController(CategoryRepository repo)
        {
            _repo = repo;
        }

        // Category list for the public feed grouping (anonymous).
        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_repo.GetAllCategories());
        }

        [HttpPost]
        public IActionResult Create(Category category)
        {
            var created = _repo.Add(category);
            return Created($"api/Categories/{created.Id}", created);
        }
    }
}
