using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HouseHoldApp.Models
{
    public class Assignments
    {
        [Key]
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Week { get; set; }
        public bool? IsCompleted { get; set; }
        public int? Rating { get; set; }
        public int ChoreId { get; set; }

        [ForeignKey("ChoreId")]
        public Chores Chore { get; set; }
    }
}