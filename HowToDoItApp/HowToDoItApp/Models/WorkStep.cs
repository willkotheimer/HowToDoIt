using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HowToDoItApp.Models
{
    /// <summary>
    /// One ordered step within a WorkSequence. Carries a short title/description
    /// and an ordered set of images. SortOrder positions the step in the sequence.
    /// </summary>
    public class WorkStep
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("WorkSequence")]
        public int WorkSequenceId { get; set; }
        public WorkSequence WorkSequence { get; set; }

        [StringLength(200)]
        public string Title { get; set; }

        public string Description { get; set; }

        // Position within the sequence (lower = first).
        public int SortOrder { get; set; }

        public ICollection<StepImage> Images { get; set; } = new List<StepImage>();
    }
}
