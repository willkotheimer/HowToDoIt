using System.ComponentModel.DataAnnotations;

namespace HouseHoldApp.Models
{
    public class LinkUserRequest
    {
        [Required]
        public int Id { get; set; }

        [Required]
        public string FirebaseKey { get; set; }
    }
}
