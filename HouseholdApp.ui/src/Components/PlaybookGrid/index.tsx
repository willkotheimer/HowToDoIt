import React, { useState, useMemo } from 'react';
import type { Chore, Category } from '../../Types';
import { getCategoryColor, buildCategoryColorMap } from '../../helpers/categoryColors';
import ChoreCard from './ChoreCard';

interface Props {
  chores: Chore[];
  categories: Category[];
  assignedChoreIds: Set<number>;
  activeChoreId: number | null;
  onSelectChore: (id: number | null) => void;
}

export default function PlaybookGrid({
  chores,
  categories,
  assignedChoreIds,
  activeChoreId,
  onSelectChore,
}: Props) {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const colorMap = useMemo(
    () => buildCategoryColorMap(categories.map((c) => c.id)),
    [categories],
  );

  const nameMap = useMemo(() => {
    const m = new Map<number, string>();
    categories.forEach((c) => m.set(c.id, c.categoryName));
    return m;
  }, [categories]);

  const filtered = useMemo(
    () =>
      activeCategoryId == null
        ? chores
        : chores.filter((c) => (c.category ?? c.Category) === activeCategoryId),
    [chores, activeCategoryId],
  );

  const handleFilterClick = (id: number | null) => {
    setActiveCategoryId(id);
    onSelectChore(null); // collapse storyboard when filter changes
  };

  return (
    <div>
      {/* Category filter row */}
      <div className="playbook-filters">
        <button
          className={`playbook-filter-btn${activeCategoryId == null ? ' playbook-filter-btn--active' : ''}`}
          onClick={() => handleFilterClick(null)}
        >
          All
        </button>
        {categories.map((cat, i) => {
          const color = getCategoryColor(i);
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              className={`playbook-filter-btn${isActive ? ' playbook-filter-btn--active' : ''}`}
              style={{
                borderColor: color,
                backgroundColor: isActive ? color : 'transparent',
                color: isActive ? '#fff' : color,
              }}
              onClick={() => handleFilterClick(isActive ? null : cat.id)}
            >
              {cat.categoryName}
            </button>
          );
        })}
      </div>

      {/* Card grid */}
      <div className="playbook-grid">
        {filtered.map((chore, i) => {
          const id = chore.id ?? chore.Id ?? i;
          const catId = chore.category ?? chore.Category ?? 0;
          const color = colorMap.get(catId) ?? getCategoryColor(i);
          const categoryName = nameMap.get(catId) ?? '';
          return (
            <ChoreCard
              key={id}
              chore={chore}
              color={color}
              categoryName={categoryName}
              isActive={id === activeChoreId}
              isAssigned={assignedChoreIds.has(id)}
              onClick={() => onSelectChore(id === activeChoreId ? null : id)}
            />
          );
        })}
      </div>
    </div>
  );
}
