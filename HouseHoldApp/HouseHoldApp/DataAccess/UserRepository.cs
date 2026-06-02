using System.Collections.Generic;
using System.Linq;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class UserRepository : IUserRepository
    {
        private readonly HouseholdContext _context;

        public UserRepository(HouseholdContext context)
        {
            _context = context;
        }

        public List<Users> GetAllUsers()
        {
            return _context.Users.OrderByDescending(u => u.Lastname).ToList();
        }

        public Users GetUserById(int id)
        {
            return _context.Users.FirstOrDefault(u => u.Id == id);
        }

        public Users GetUserByFirebaseKey(string firebaseKey)
        {
            return _context.Users.FirstOrDefault(u => u.FirebaseKey == firebaseKey);
        }

        public List<UserHousehold> GetUsersInUsersHouseHold(int id)
        {
            var householdId = _context.HouseHoldUsers
                .Where(hu => hu.UserId == id)
                .Select(hu => hu.HouseholdId)
                .FirstOrDefault();

            return _context.HouseHoldUsers
                .Where(hu => hu.HouseholdId == householdId)
                .Join(_context.Users,
                      hu => hu.UserId,
                      u => u.Id,
                      (hu, u) => new UserHousehold
                      {
                          Id = u.Id,
                          Firstname = u.Firstname,
                          Lastname = u.Lastname,
                          Email = u.Email,
                          FirebaseKey = u.FirebaseKey,
                          HouseholdId = hu.HouseholdId
                      })
                .OrderByDescending(u => u.Lastname)
                .ToList();
        }

        public void AddAUser(Users user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
        }

        public void UpdateUser(Users user)
        {
            var existing = _context.Users.FirstOrDefault(u => u.Id == user.Id);
            if (existing != null)
            {
                existing.Firstname = user.Firstname;
                existing.Lastname = user.Lastname;
                existing.Email = user.Email;
                _context.SaveChanges();
            }
        }
    }
}
