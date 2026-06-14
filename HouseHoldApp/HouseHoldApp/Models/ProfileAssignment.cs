using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HouseHoldApp.Models
{
    public class ProfileAssignment
    {
        [Key]
        public int Id { get; set; }

        public int ProfileId { get; set; }

        public int UserId { get; set; }

        public int Week { get; set; }

        public int HouseholdId { get; set; }

        [ForeignKey("ProfileId")]
        public Profile Profile { get; set; }
    }
}
