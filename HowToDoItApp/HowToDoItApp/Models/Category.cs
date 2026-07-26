using System.ComponentModel.DataAnnotations;

namespace HowToDoItApp.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string CategoryName { get; set; }
    }
}
