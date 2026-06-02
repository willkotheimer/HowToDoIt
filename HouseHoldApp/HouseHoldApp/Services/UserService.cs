using System.Collections.Generic;
using HouseHoldApp.DataAccess;
using HouseHoldApp.Models;

namespace HouseHoldApp.Services
{
    public class UserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public List<Users> GetAllUsers() => _userRepository.GetAllUsers();
        public Users GetUserById(int id) => _userRepository.GetUserById(id);
        public Users GetUserByFirebaseKey(string firebaseKey) => _userRepository.GetUserByFirebaseKey(firebaseKey);
        public List<UserHousehold> GetUsersInUsersHouseHold(int id) => _userRepository.GetUsersInUsersHouseHold(id);
        public void AddAUser(Users user) => _userRepository.AddAUser(user);
        public void UpdateUser(Users user) => _userRepository.UpdateUser(user);
    }
}
