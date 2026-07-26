using System.Collections.Generic;
using System.Linq;
using HowToDoItApp.Models;

namespace HowToDoItApp.DataAccess
{
    public class StepImageRepository
    {
        private readonly HowToDoItContext _context;

        public StepImageRepository(HowToDoItContext context)
        {
            _context = context;
        }

        public List<StepImage> GetByStepId(int stepId)
        {
            return _context.StepImages
                .Where(i => i.WorkStepId == stepId)
                .OrderBy(i => i.SortOrder)
                .ThenBy(i => i.Id)
                .ToList();
        }

        public StepImage GetById(int id)
        {
            return _context.StepImages.FirstOrDefault(i => i.Id == id);
        }

        // New images append to the end of the step unless a SortOrder was set.
        public StepImage Add(StepImage image)
        {
            if (image.SortOrder == 0)
            {
                var max = _context.StepImages
                    .Where(i => i.WorkStepId == image.WorkStepId)
                    .Select(i => (int?)i.SortOrder)
                    .Max() ?? -1;
                image.SortOrder = max + 1;
            }
            _context.StepImages.Add(image);
            _context.SaveChanges();
            return image;
        }

        // Persist a new display order: SortOrder = position in the given id list.
        public void UpdateImageOrder(int[] orderedImageIds)
        {
            for (var i = 0; i < orderedImageIds.Length; i++)
            {
                var image = _context.StepImages.FirstOrDefault(img => img.Id == orderedImageIds[i]);
                if (image != null)
                {
                    image.SortOrder = i;
                }
            }
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var image = _context.StepImages.FirstOrDefault(i => i.Id == id);
            if (image != null)
            {
                _context.StepImages.Remove(image);
                _context.SaveChanges();
            }
        }
    }
}
