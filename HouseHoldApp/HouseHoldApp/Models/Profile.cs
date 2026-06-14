using System.ComponentModel.DataAnnotations;

namespace HouseHoldApp.Models
{
    public class Profile
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public int HouseholdId { get; set; }
    }
}
