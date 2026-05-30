using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HouseHoldApp.Models
{
    [Table("Household")]
    public class Household
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        public ICollection<HouseholdUser> HouseholdUsers { get; set; }
        public ICollection<Chores> Chores { get; set; }
    }
}
