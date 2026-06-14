using System.Linq;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class HouseholdSettingsRepository
    {
        private readonly HouseholdContext _context;

        public HouseholdSettingsRepository(HouseholdContext context)
        {
            _context = context;
        }

        public HouseholdSettings GetByHouseholdId(int householdId)
        {
            return _context.HouseholdSettings
                .FirstOrDefault(s => s.HouseholdId == householdId);
        }

        public void Update(HouseholdSettings settings)
        {
            var existing = _context.HouseholdSettings
                .FirstOrDefault(s => s.HouseholdId == settings.HouseholdId);
            if (existing != null)
            {
                existing.MaxChoresPerProfile = settings.MaxChoresPerProfile;
                existing.RolloverEnabled = settings.RolloverEnabled;
                _context.SaveChanges();
            }
        }

        public void CreateDefault(int householdId)
        {
            _context.HouseholdSettings.Add(new HouseholdSettings { HouseholdId = householdId });
            _context.SaveChanges();
        }
    }
}
