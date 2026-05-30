using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HouseHoldApp.Models
{
    [Table("HouseholdUser")]
    public class HouseholdUser
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Users")]
        public int UserId { get; set; }
        public Users User { get; set; }

        [ForeignKey("Household")]
        public int HouseholdId { get; set; }
        public Household Household { get; set; }

        [Required]
        public bool IsConfirmed { get; set; }
    }

    public class HouseholdUserId
    {
        public int HouseholdId { get; set; }
    }
}
