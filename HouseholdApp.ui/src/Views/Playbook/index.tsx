import React, { useState, useMemo } from 'react';
import week from '../../data/weekNum';
import { useChoresByHousehold } from '../../data/choresData';
import { useAssignmentsByHouseHoldId } from '../../data/assignmentData';
import { useCategories } from '../../data/categoryData';
import PlaybookGrid from '../../Components/PlaybookGrid';
import StoryboardPanel from '../../Components/StoryboardPanel';
import { useAuth } from '../../context/AuthContext';
import { buildCategoryColorMap } from '../../helpers/categoryColors';
import type { Chore } from '../../Types';

export default function PlaybookView() {
  const { householdId } = useAuth();
  const [activeChoreId, setActiveChoreId] = useState<number | null>(null);

  const { data: chores = [] } = useChoresByHousehold(householdId);
  const { data: categories = [] } = useCategories();
  const { data: assignments = [] } = useAssignmentsByHouseHoldId(householdId);

  const assignedChoreIds = useMemo<Set<number>>(() => {
    const thisWeek = week.thisWeek();
    return new Set(
      assignments
        .filter((a) => a.week === thisWeek)
        .map((a) => a.choreId),
    );
  }, [assignments]);

  const colorMap = useMemo(
    () => buildCategoryColorMap(categories.map((c) => c.id)),
    [categories],
  );

  const activeChore: Chore | null = useMemo(
    () => chores.find((c) => (c.id ?? c.Id) === activeChoreId) ?? null,
    [chores, activeChoreId],
  );

  const activeCategory = activeChore
    ? categories.find((c) => c.id === (activeChore.category ?? activeChore.Category))
    : null;

  const activeColor = activeCategory ? colorMap.get(activeCategory.id) ?? '#1d4ed8' : '#1d4ed8';

  function closeOverlay() {
    setActiveChoreId(null);
  }

  return (
    <div className="playbook-page">
      <div className="playbook-header">
        <div className="playbook-header-text">
          <h1 className="playbook-title">The Playbook</h1>
          <p className="playbook-subtitle">
            Your household's chore reference guide — week {week.thisWeek()}
          </p>
        </div>
      </div>

      <PlaybookGrid
        chores={chores}
        categories={categories}
        assignedChoreIds={assignedChoreIds}
        activeChoreId={activeChoreId}
        onSelectChore={setActiveChoreId}
      />

      {activeChore && (
        <div className="playbook-overlay" onClick={closeOverlay}>
          <div className="playbook-overlay-panel" onClick={(e) => e.stopPropagation()}>
            <button
              className="playbook-overlay-close"
              onClick={closeOverlay}
              aria-label="Close"
            >
              ✕
            </button>
            <StoryboardPanel
              chore={activeChore}
              color={activeColor}
              categoryName={activeCategory?.categoryName ?? ''}
              isAssigned={assignedChoreIds.has(activeChore.id ?? activeChore.Id ?? 0)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
