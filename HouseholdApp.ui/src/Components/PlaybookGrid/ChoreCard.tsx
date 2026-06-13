import React from 'react';
import type { Chore } from '../../Types';
import { parseSteps } from '../../helpers/parseSteps';

interface Props {
  chore: Chore;
  color: string;
  categoryName: string;
  isActive: boolean;
  isAssigned: boolean;
  onClick: () => void;
}

export default function ChoreCard({ chore, color, categoryName, isActive, isAssigned, onClick }: Props) {
  const name = chore.name ?? chore.Name ?? '';
  const description = chore.description ?? chore.Description ?? '';
  const firstStep = parseSteps(description)[0] ?? description;
  const preview = firstStep.length > 72 ? `${firstStep.slice(0, 72)}…` : firstStep;

  return (
    <div
      className={`chore-card${isActive ? ' chore-card--active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* Category colour bar */}
      <div className="chore-card-bar" style={{ backgroundColor: color }} />

      {/* Placeholder image */}
      <div className="chore-card-img">
        <div className="chore-card-img-placeholder">
          <span className="chore-card-img-icon">📷</span>
          <span className="chore-card-img-label">No image yet</span>
        </div>
      </div>

      <div className="chore-card-body">
        <div className="chore-card-meta">
          <span className="chore-card-category" style={{ backgroundColor: color }}>
            {categoryName}
          </span>
          {isAssigned && (
            <span className="chore-card-assigned">● This week</span>
          )}
        </div>

        <div className="chore-card-name">{name}</div>

        {preview && (
          <div className="chore-card-preview">{preview}</div>
        )}

        <div className="chore-card-cta" style={{ color }}>
          {isActive ? 'Close ▲' : 'View steps ▼'}
        </div>
      </div>
    </div>
  );
}
