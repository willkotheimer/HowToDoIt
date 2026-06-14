using System.ComponentModel.DataAnnotations;

namespace HouseHoldApp.Models
{
    public class HouseholdSettings
    {
        [Key]
        public int Id { get; set; }

        public int HouseholdId { get; set; }

        public int MaxChoresPerProfile { get; set; } = 10;

        public bool RolloverEnabled { get; set; } = true;
    }
}
