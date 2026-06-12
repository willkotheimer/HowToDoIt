using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HouseHoldApp.Models
{

    namespace HouseHoldApp.Models
    {
        public class AssignmentsChores
        {
            public AssignmentsChores() { }

            // Constructor accepting Assignments entity
            public AssignmentsChores(Assignments assignment)
            {
                UserId = assignment.UserId;
                Week = assignment.Week;
                IsCompleted = assignment.IsCompleted ?? false;
                Rating = assignment.Rating ?? 0;
                ChoreId = assignment.ChoreId;
                Id = assignment.Id;
                Name = assignment.Chore.Name;
                Description = assignment.Chore.Description;
                HouseHoldId = assignment.Chore.HouseHoldId;
                Category = assignment.Chore.Category;
            }


            public int UserId { get; set; }
            public int Week { get; set; }
            public bool IsCompleted { get; set; }
            public int Rating { get; set; }
            public int ChoreId { get; set; }
            public int Id { get; set; }
            public string Name { get; set; }
            public string Description { get; set; }
            public int HouseHoldId { get; set; }
            public int Category { get; set; }

           
        }
    }

}
