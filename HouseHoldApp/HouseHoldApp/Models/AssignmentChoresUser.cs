using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HouseHoldApp.Models;

namespace HouseHoldApp.Models
{
    public class AssignmentsChoresUser
    {
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public string FirebaseKey { get; set; }
        public string Id { get; set; }
        public int userId { get; set; }
        public int Week { get; set; }
        public bool isCompleted { get; set; }
        public int Rating { get; set; }
        public int choreId { get; set; }
        public int assignmentId { get; set; }
        public string Chorename { get; set; }
        public string ChoreDescription { get; set; }
        public int HouseHoldId { get; set; }
        public string CategoryName { get; set; }
    }
}
