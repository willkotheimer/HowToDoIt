using System;
using System.Collections.Generic;
using System.Linq;
using HowToDoItApp.Models;
using Microsoft.EntityFrameworkCore;

namespace HowToDoItApp.DataAccess
{
    public class WorkSequenceRepository
    {
        private readonly HowToDoItContext _context;

        public WorkSequenceRepository(HowToDoItContext context)
        {
            _context = context;
        }

        // Feed listing: sequences with their category, newest first. Steps/images
        // are not loaded here (kept lightweight for the grid).
        public List<WorkSequence> GetAll()
        {
            var sequences = _context.WorkSequences
                .Include(s => s.Category)
                .OrderByDescending(s => s.UpdatedAt)
                .ToList();

            // Populate each card's cover thumbnail: the first image of the first
            // step (by sort order). Kept as a lightweight per-sequence lookup.
            foreach (var sequence in sequences)
            {
                sequence.CoverImageUrl = _context.StepImages
                    .Where(i => i.WorkStep.WorkSequenceId == sequence.Id)
                    .OrderBy(i => i.WorkStep.SortOrder)
                    .ThenBy(i => i.SortOrder)
                    .ThenBy(i => i.Id)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault();
            }

            return sequences;
        }

        // Full detail: the sequence with ordered steps and each step's ordered images.
        public WorkSequence GetById(int id)
        {
            return _context.WorkSequences
                .Include(s => s.Category)
                .Include(s => s.Steps.OrderBy(st => st.SortOrder).ThenBy(st => st.Id))
                    .ThenInclude(st => st.Images.OrderBy(im => im.SortOrder).ThenBy(im => im.Id))
                .FirstOrDefault(s => s.Id == id);
        }

        public WorkSequence Add(WorkSequence sequence)
        {
            var now = DateTime.UtcNow;
            sequence.CreatedAt = now;
            sequence.UpdatedAt = now;
            _context.WorkSequences.Add(sequence);
            _context.SaveChanges();
            return sequence;
        }

        public void Update(WorkSequence sequence)
        {
            var existing = _context.WorkSequences.FirstOrDefault(s => s.Id == sequence.Id);
            if (existing == null) return;

            existing.Title = sequence.Title;
            existing.Domain = sequence.Domain;
            existing.Description = sequence.Description;
            existing.CategoryId = sequence.CategoryId;
            existing.IsPublic = sequence.IsPublic;
            existing.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();
        }

        // Returns the public blob URLs of every image under this sequence so the
        // caller can delete them from storage before the rows cascade away.
        public List<string> GetImageUrls(int id)
        {
            return _context.StepImages
                .Where(im => im.WorkStep.WorkSequenceId == id)
                .Select(im => im.ImageUrl)
                .ToList();
        }

        public void Delete(int id)
        {
            var sequence = _context.WorkSequences.FirstOrDefault(s => s.Id == id);
            if (sequence != null)
            {
                _context.WorkSequences.Remove(sequence);
                _context.SaveChanges();
            }
        }
    }
}
