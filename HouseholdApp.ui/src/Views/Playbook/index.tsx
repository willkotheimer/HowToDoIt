import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import week from '../../data/weekNum';
import { useChoresByHousehold } from '../../data/choresData';
import { useCategories } from '../../data/categoryData';
import { useAssignmentsByHouseholdFromUserId, useSetAssignmentAsDone } from '../../data/assignmentData';
import { useImagesByChoreId } from '../../data/imageData';
import { useAuth } from '../../context/AuthContext';
import { buildCategoryColorMap } from '../../helpers/categoryColors';
import type { Assignment, Chore, Category } from '../../Types';

function CardImages({ choreId }: { choreId: number }) {
  const { data: images = [] } = useImagesByChoreId(choreId);
  if (images.length === 0) {
    return (
      <div className="my-card-img-placeholder">
        <span className="my-card-img-icon">📋</span>
      </div>
    );
  }
  return (
    <div className="my-card-images">
      {images.slice(0, 2).map((img) => (
        <img key={img.id} src={img.image} alt="" className="my-card-image" />
      ))}
    </div>
  );
}

function AssignmentCard({
  assignment,
  chore,
  category,
  color,
  onMarkDone,
  onOpen,
}: {
  assignment: Assignment;
  chore?: Chore;
  category?: Category;
  color: string;
  onMarkDone: () => void;
  onOpen: () => void;
}) {
  const choreName = assignment.chorename ?? chore?.name ?? chore?.Name ?? `Task #${assignment.choreId}`;
  const desc = chore?.description ?? chore?.Description ?? '';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <div
      className={`my-card my-card--clickable${assignment.isCompleted ? ' my-card--done' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={handleKeyDown}
    >
      <div className="my-card-bar" style={{ backgroundColor: color }} />
      <CardImages choreId={assignment.choreId} />
      <div className="my-card-body">
        <div className="my-card-meta">
          {category && (
            <span className="my-card-category" style={{ backgroundColor: color }}>
              {category.categoryName}
            </span>
          )}
          {assignment.isCompleted && <span className="my-card-done-badge">Done</span>}
        </div>
        <h3 className="my-card-name">{choreName}</h3>
        {desc && (
          <p className="my-card-desc">
            {desc.slice(0, 100)}{desc.length > 100 ? '…' : ''}
          </p>
        )}
        {!assignment.isCompleted && (
          <button
            className="my-card-mark-done"
            onClick={(e) => {
              e.stopPropagation();
              onMarkDone();
            }}
          >
            Mark Done
          </button>
        )}
      </div>
    </div>
  );
}

export default function PlaybookView() {
  const { uid, householdId, userHousehold } = useAuth();
  const history = useHistory();
  const currentWeek = week.thisWeek();

  const myId = useMemo(
    () => userHousehold?.find((uh) => uh.firebaseKey === uid)?.id,
    [userHousehold, uid],
  );

  const { data: rawAssignments = [] } = useAssignmentsByHouseholdFromUserId(myId ?? 0, !!myId);
  const { data: allChores = [] } = useChoresByHousehold(householdId);
  const { data: categories = [] } = useCategories();
  const markDone = useSetAssignmentAsDone();

  const myAssignments = useMemo(
    () => rawAssignments.filter((a) => a.week === currentWeek),
    [rawAssignments, currentWeek],
  );

  const colorMap = useMemo(
    () => buildCategoryColorMap(categories.map((c) => c.id)),
    [categories],
  );

  const cards = useMemo(
    () =>
      myAssignments.map((a) => {
        const chore = allChores.find((c) => (c.id ?? c.Id) === a.choreId);
        const catId = chore?.category ?? chore?.Category;
        const category = catId !== undefined ? categories.find((c) => c.id === catId) : undefined;
        const color = category ? colorMap.get(category.id) ?? '#1d4ed8' : '#1d4ed8';
        return { assignment: a, chore, category, color };
      }),
    [myAssignments, allChores, categories, colorMap],
  );

  const doneCount = myAssignments.filter((a) => a.isCompleted).length;

  return (
    <div className="playbook-page">
      <div className="playbook-header">
        <h1 className="playbook-title">My Playbook</h1>
        <p className="playbook-subtitle">
          Week {currentWeek} — {doneCount} of {myAssignments.length} tasks done
        </p>
      </div>

      {myAssignments.length === 0 ? (
        <div className="my-playbook-empty">
          <p>No tasks assigned to you this week.</p>
          <p>Head to <strong>Profiles</strong> to set up your week.</p>
        </div>
      ) : (
        <div className="my-playbook-grid">
          {cards.map(({ assignment, chore, category, color }) => (
            <AssignmentCard
              key={assignment.id ?? assignment.assignmentId ?? assignment.choreId}
              assignment={assignment}
              chore={chore}
              category={category}
              color={color}
              onOpen={() =>
                history.push(`/chore/${assignment.choreId}`, { readOnly: true })
              }
              onMarkDone={() =>
                markDone.mutate({
                  id: assignment.id,
                  assignmentId: assignment.assignmentId,
                  isCompleted: true,
                })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
