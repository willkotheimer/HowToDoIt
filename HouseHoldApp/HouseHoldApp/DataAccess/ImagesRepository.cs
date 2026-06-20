using System.Collections.Generic;
using System.Linq;
using HouseHoldApp.Models;

namespace HouseHoldApp.DataAccess
{
    public class ImagesRepository
    {
        private readonly HouseholdContext _context;

        public ImagesRepository(HouseholdContext context)
        {
            _context = context;
        }

        public List<Images> GetAllImages()
        {
            return _context.Images.ToList();
        }

        public List<Images> GetImageByChoreId(int choreId)
        {
            return _context.Images
                .Where(i => i.ChoreId == choreId)
                .OrderBy(i => i.SortOrder)
                .ThenBy(i => i.Id)
                .ToList();
        }

        public Images GetImageById(int id)
        {
            return _context.Images.FirstOrDefault(i => i.Id == id);
        }

        public Images GetOneImageByChoreId(int choreId)
        {
            return _context.Images.FirstOrDefault(i => i.ChoreId == choreId);
        }

        public List<Images> GetOneImagePerChoreId()
        {
            return _context.Images
                .GroupBy(i => i.ChoreId)
                .Select(g => g.OrderBy(i => i.SortOrder).ThenBy(i => i.Id).First())
                .ToList();
        }

        public void AddAnImage(Images image)
        {
            _context.Images.Add(image);
            _context.SaveChanges();
        }

        // Persist a new display order: SortOrder = position in the given id list.
        public void UpdateImageOrder(int[] orderedImageIds)
        {
            for (var i = 0; i < orderedImageIds.Length; i++)
            {
                var image = _context.Images.FirstOrDefault(img => img.Id == orderedImageIds[i]);
                if (image != null)
                {
                    image.SortOrder = i;
                }
            }
            _context.SaveChanges();
        }

        public void DeleteImage(int id)
        {
            var image = _context.Images.FirstOrDefault(i => i.Id == id);
            if (image != null)
            {
                _context.Images.Remove(image);
                _context.SaveChanges();
            }
        }
    }
}
