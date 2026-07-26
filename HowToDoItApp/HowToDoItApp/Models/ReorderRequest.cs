namespace HowToDoItApp.Models
{
    /// <summary>
    /// Generic reorder payload: entity ids in the desired display order.
    /// Used for reordering both steps within a sequence and images within a step.
    /// </summary>
    public class ReorderRequest
    {
        public int[] Ids { get; set; }
    }
}
