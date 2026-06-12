import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChoresByHousehold } from '../../data/choresData';
import { useImagesByChoreId } from '../../data/imageData';
import { parseChoreDescription } from '../../helpers/ChoreInfoHelper';
import type { Chore, ImageRecord } from '../../Types';

const TAB_COLORS = ['#7c3aed', '#15803d', '#92400e', '#b91c1c', '#1d4ed8'];

function ChoreImages({ choreId }: { choreId: number }) {
  const { data: images = [] } = useImagesByChoreId(choreId);
  if (!images.length) return null;
  return (
    <div className="ac-image-strip">
      {images.map((img: ImageRecord) => (
        <img key={img.id} src={img.image} alt="" className="ac-image" />
      ))}
    </div>
  );
}

function ChoreDetailPanel({ chore, color }: { chore: Chore; color: string }) {
  const choreId = chore.id ?? chore.Id ?? 0;
  const description = chore.description ?? chore.Description ?? '';
  const steps = description
    ? parseChoreDescription(description).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="ac-panel" style={{ borderColor: color }}>
      <h1 className="ac-chore-name" style={{ color }}>
        {chore.name ?? chore.Name}
      </h1>

      {steps.length > 0 && (
        <div className="ac-steps-section">
          <div className="ac-steps-label">HOW TO DO IT</div>
          <ol className="ac-steps-list">
            {steps.map((step, i) => (
              <li key={i} className="ac-step">{step}</li>
            ))}
          </ol>
        </div>
      )}

      <ChoreImages choreId={choreId} />
    </div>
  );
}

export default function AvailableChores() {
  const { householdId } = useAuth();
  const { data: chores = [] } = useChoresByHousehold(householdId);
  const [activeId, setActiveId] = useState<number | null>(null);

  const activeIndex = chores.findIndex((c) => (c.id ?? c.Id) === activeId);
  const activeChore = activeIndex >= 0 ? chores[activeIndex] : null;
  const activeColor = TAB_COLORS[activeIndex >= 0 ? activeIndex % TAB_COLORS.length : 0];

  return (
    <section className="available-chores">
      <h2 className="ac-section-heading">Available Chores</h2>

      <div className="ac-tabs">
        {chores.map((chore, i) => {
          const id = chore.id ?? chore.Id ?? i;
          const color = TAB_COLORS[i % TAB_COLORS.length];
          const isActive = id === activeId;
          return (
            <button
              key={id}
              className={`ac-tab${isActive ? ' ac-tab--active' : ''}`}
              style={{
                backgroundColor: isActive ? color : `${color}bb`,
                borderColor: color,
                boxShadow: isActive ? `0 0 24px ${color}99` : 'none',
              }}
              onClick={() => setActiveId(isActive ? null : id)}
            >
              {chore.name ?? chore.Name}
            </button>
          );
        })}
      </div>

      {activeChore && (
        <ChoreDetailPanel chore={activeChore} color={activeColor} />
      )}
    </section>
  );
}
