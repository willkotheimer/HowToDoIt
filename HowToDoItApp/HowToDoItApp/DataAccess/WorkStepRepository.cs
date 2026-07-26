using System.Collections.Generic;
using System.Linq;
using HowToDoItApp.Models;
using Microsoft.EntityFrameworkCore;

namespace HowToDoItApp.DataAccess
{
    public class WorkStepRepository
    {
        private readonly HowToDoItContext _context;

        public WorkStepRepository(HowToDoItContext context)
        {
            _context = context;
        }

        public List<WorkStep> GetBySequenceId(int sequenceId)
        {
            return _context.WorkSteps
                .Where(s => s.WorkSequenceId == sequenceId)
                .Include(s => s.Images.OrderBy(im => im.SortOrder).ThenBy(im => im.Id))
                .OrderBy(s => s.SortOrder)
                .ThenBy(s => s.Id)
                .ToList();
        }

        public WorkStep GetById(int id)
        {
            return _context.WorkSteps.FirstOrDefault(s => s.Id == id);
        }

        // New steps append to the end of the sequence unless a SortOrder was set.
        public WorkStep Add(WorkStep step)
        {
            if (step.SortOrder == 0)
            {
                var max = _context.WorkSteps
                    .Where(s => s.WorkSequenceId == step.WorkSequenceId)
                    .Select(s => (int?)s.SortOrder)
                    .Max() ?? -1;
                step.SortOrder = max + 1;
            }
            _context.WorkSteps.Add(step);
            _context.SaveChanges();
            return step;
        }

        public void Update(WorkStep step)
        {
            var existing = _context.WorkSteps.FirstOrDefault(s => s.Id == step.Id);
            if (existing == null) return;

            existing.Title = step.Title;
            existing.Description = step.Description;
            _context.SaveChanges();
        }

        // Persist a new step order: SortOrder = position in the given id list.
        public void UpdateStepOrder(int[] orderedStepIds)
        {
            for (var i = 0; i < orderedStepIds.Length; i++)
            {
                var step = _context.WorkSteps.FirstOrDefault(s => s.Id == orderedStepIds[i]);
                if (step != null)
                {
                    step.SortOrder = i;
                }
            }
            _context.SaveChanges();
        }

        public void Delete(int id)
        {
            var step = _context.WorkSteps.FirstOrDefault(s => s.Id == id);
            if (step != null)
            {
                _context.WorkSteps.Remove(step);
                _context.SaveChanges();
            }
        }
    }
}
