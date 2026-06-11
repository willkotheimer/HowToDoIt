using System.Collections.Generic;
using System.Linq;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class HouseHoldUserRepository
    {
        private readonly HouseholdContext _context;

        public HouseHoldUserRepository(HouseholdContext context)
        {
            _context = context;
        }

        public HouseHoldUser GetHouseHoldUserById(int id)
        {
            return _context.HouseHoldUsers.FirstOrDefault(hu => hu.Id == id);
        }

        public HouseHoldUser GetHouseHoldUserByUserId(int id)
        {
            return _context.HouseHoldUsers.FirstOrDefault(hu => hu.UserId == id);
        }

        public HouseHoldUserId GetHouseHoldIdUserId(string id)
        {
            return _context.Users
                .Where(u => u.FirebaseKey == id)
                .Join(_context.HouseHoldUsers.Where(hhu => hhu.IsConfirmed),
                      u => u.Id,
                      hhu => hhu.UserId,
                      (u, hhu) => new HouseHoldUserId { HouseholdId = hhu.HouseholdId })
                .FirstOrDefault();
        }

        public List<UserHousehold> GetUsersInUsersHouseHold(string id)
        {
            var householdId = _context.Users
                .Where(u => u.FirebaseKey == id)
                .Join(_context.HouseHoldUsers,
                      u => u.Id,
                      hhu => hhu.UserId,
                      (u, hhu) => hhu.HouseholdId)
                .FirstOrDefault();

            return _context.HouseHoldUsers
                .Where(hhu => hhu.HouseholdId == householdId)
                .Join(_context.Users,
                      hhu => hhu.UserId,
                      u => u.Id,
                      (hhu, u) => new UserHousehold
                      {
                          Id = u.Id,
                          Firstname = u.Firstname,
                          Lastname = u.Lastname,
                          Email = u.Email,
                          FirebaseKey = u.FirebaseKey,
                          HouseholdId = hhu.HouseholdId
                      })
                .OrderByDescending(u => u.Lastname)
                .ToList();
        }

        public List<UserHousehold> GetUsersByHouseholdId(int householdId)
        {
            return _context.HouseHoldUsers
                .Where(hhu => hhu.HouseholdId == householdId)
                .Join(_context.Users,
                      hhu => hhu.UserId,
                      u => u.Id,
                      (hhu, u) => new UserHousehold
                      {
                          Id = u.Id,
                          Firstname = u.Firstname,
                          Lastname = u.Lastname,
                          Email = u.Email,
                          FirebaseKey = u.FirebaseKey,
                          HouseholdId = hhu.HouseholdId
                      })
                .OrderByDescending(u => u.Lastname)
                .ToList();
        }

        public void AddAHouseHoldUser(HouseHoldUser householdUser)
        {
            _context.HouseHoldUsers.Add(householdUser);
            _context.SaveChanges();
        }

        public void ConfirmHouseHoldUser(HouseHoldUser householdUser)
        {
            var existing = _context.HouseHoldUsers.FirstOrDefault(hu => hu.Id == householdUser.Id);
            if (existing != null)
            {
                existing.IsConfirmed = true;
                _context.SaveChanges();
            }
        }

        public void DeleteHouseHoldUser(HouseHoldUser householdUser)
        {
            var existing = _context.HouseHoldUsers.FirstOrDefault(hu => hu.UserId == householdUser.Id);
            if (existing != null)
            {
                _context.HouseHoldUsers.Remove(existing);
                _context.SaveChanges();
            }
        }
    }
}
