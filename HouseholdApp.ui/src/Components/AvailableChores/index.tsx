import React from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useChoresByHousehold } from '../../data/choresData';
import { useCategories } from '../../data/categoryData';
import { buildCategoryColorMap } from '../../helpers/categoryColors';

const PREVIEW_COUNT = 8;

export default function AvailableChores() {
  const history = useHistory();
  const { householdId } = useAuth();
  const { data: chores = [] } = useChoresByHousehold(householdId);
  const { data: categories = [] } = useCategories();

  const colorMap = React.useMemo(
    () => buildCategoryColorMap(categories.map((c) => c.id)),
    [categories],
  );

  const preview = chores.slice(0, PREVIEW_COUNT);

  return (
    <section className="ac-teaser">
      <div className="ac-teaser-left">
        <h2 className="ac-teaser-heading">The Playbook</h2>
        <p className="ac-teaser-sub">
          {chores.length} chore{chores.length !== 1 ? 's' : ''} documented — tap any to see its runbook
        </p>
        <div className="ac-teaser-chips">
          {preview.map((chore, i) => {
            const catId = chore.category ?? chore.Category ?? 0;
            const color = colorMap.get(catId) ?? '#1d4ed8';
            return (
              <span
                key={chore.id ?? i}
                className="ac-teaser-chip"
                style={{ backgroundColor: color }}
              >
                {chore.name ?? chore.Name}
              </span>
            );
          })}
          {chores.length > PREVIEW_COUNT && (
            <span className="ac-teaser-chip" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
              +{chores.length - PREVIEW_COUNT} more
            </span>
          )}
        </div>
      </div>

      <button className="ac-teaser-cta" onClick={() => history.push('/playbook')}>
        Open the Playbook →
      </button>
    </section>
  );
}
