using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HowToDoItApp.Models
{
    /// <summary>
    /// A visual work sequence / SOP: an ordered set of steps, each with images.
    /// Belongs (optionally) to a Category. Public sequences appear in the
    /// unauthenticated feed; private ones are visible only to writers.
    /// </summary>
    public class WorkSequence
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; }

        // High-level grouping for the browse splash (e.g. "Coffee Shop",
        // "Retail Store"). Sequences are shown in a carousel row per domain.
        [StringLength(100)]
        public string Domain { get; set; }

        public string Description { get; set; }

        [ForeignKey("Category")]
        public int? CategoryId { get; set; }
        public Category Category { get; set; }

        // True = visible in the public feed. False = internal/private.
        public bool IsPublic { get; set; } = true;

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Not persisted: the first step's first image URL, populated by the feed
        // listing so cards can show a thumbnail without loading every step.
        [NotMapped]
        public string CoverImageUrl { get; set; }

        public ICollection<WorkStep> Steps { get; set; } = new List<WorkStep>();
    }
}
