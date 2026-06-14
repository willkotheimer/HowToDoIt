using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HouseHoldApp.Models
{
    public class ProfileChore
    {
        [Key]
        public int Id { get; set; }

        public int ProfileId { get; set; }

        public int ChoreId { get; set; }

        [ForeignKey("ChoreId")]
        public Chores Chore { get; set; }
    }
}
