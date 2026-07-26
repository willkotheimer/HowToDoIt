import React from 'react';
import { Link } from 'react-router-dom';
import type { WorkSequence } from '../../Types';

export default function SequenceCard({ sequence }: { sequence: WorkSequence }) {
  return (
    <Link to={`/sequence/${sequence.id}`} className="sequence-card-link">
      <div className="sequence-card">
        {sequence.coverImageUrl ? (
          <img className="sequence-card__img" src={sequence.coverImageUrl} alt={sequence.title} />
        ) : (
          <div className="sequence-card__img-placeholder">No image yet</div>
        )}
        <div className="sequence-card__body">
          {sequence.category?.categoryName && (
            <span className="sequence-card__category">{sequence.category.categoryName}</span>
          )}
          <h3 className="sequence-card__title">{sequence.title}</h3>
          {sequence.description && <p className="sequence-card__desc">{sequence.description}</p>}
          {!sequence.isPublic && <span className="sequence-card__private">Private</span>}
        </div>
      </div>
    </Link>
  );
}
