using System.Collections.Generic;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public interface IUserRepository
    {
        List<Users> GetAllUsers();
        Users GetUserById(int id);
        Users GetUserByFirebaseKey(string firebaseKey);
        Users GetUserByEmail(string email);
        List<UserHousehold> GetUsersInUsersHouseHold(int id);
        void AddAUser(Users user);
        void UpdateUser(Users user);
        void LinkFirebaseKey(int id, string firebaseKey);
    }
}
