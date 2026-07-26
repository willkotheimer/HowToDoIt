using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HowToDoItApp.Models
{
    /// <summary>
    /// An image attached to a WorkStep. Replaces the old chore-scoped Images model:
    /// images are now tied to a step (StepId) instead of a chore. ImageUrl is the
    /// public blob URL. SortOrder positions the image within the step.
    /// </summary>
    public class StepImage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ImageUrl { get; set; }

        [ForeignKey("WorkStep")]
        public int WorkStepId { get; set; }
        public WorkStep WorkStep { get; set; }

        // Soft-active flag carried over from the old Images model (1 = active).
        public int Active { get; set; } = 1;

        // Display order within the step (lower = first).
        public int SortOrder { get; set; }
    }
}
