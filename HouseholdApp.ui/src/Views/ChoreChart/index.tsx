import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAssignmentsByHouseholdFromUserId, useSetAssignmentAsDone } from '../../data/assignmentData';
import { useChoresByHousehold } from '../../data/choresData';
import { useCategories } from '../../data/categoryData';
import { useMainImages } from '../../data/imageData';
import { buildCategoryColorMap } from '../../helpers/categoryColors';
import week from '../../data/weekNum';
import type { Assignment } from '../../Types';

function toMarkDonePayload(a: Assignment) {
  return {
    id: a.assignmentId ?? a.id,
    userId: a.userId,
    week: a.week,
    isCompleted: a.isCompleted,
    rating: a.rating,
    choreId: a.choreId,
  };
}

export default function ChoreChartView() {
  const { uid, userHousehold, householdId, user } = useAuth();
  const [dragId, setDragId] = useState<number | null>(null);
  const [dropOver, setDropOver] = useState(false);

  const myId = useMemo(
    () => userHousehold?.find((uh) => uh.firebaseKey === uid)?.id ?? 0,
    [userHousehold, uid],
  );

  const { data: assignments = [] } = useAssignmentsByHouseholdFromUserId(myId);
  const { data: chores = [] } = useChoresByHousehold(householdId);
  const { data: categories = [] } = useCategories();
  const { data: mainImages = [] } = useMainImages();
  const markDone = useSetAssignmentAsDone();

  // Show all assignments — no week filter — same as Assignment Board
  const todoItems = useMemo(() => assignments.filter((a) => !a.isCompleted), [assignments]);
  const doneItems = useMemo(() => assignments.filter((a) => a.isCompleted), [assignments]);

  const colorMap = useMemo(
    () => buildCategoryColorMap(categories.map((c) => c.id)),
    [categories],
  );

  const choreMap = useMemo(() => {
    const m = new Map<number, typeof chores[0]>();
    chores.forEach((c) => m.set(c.id ?? c.Id ?? 0, c));
    return m;
  }, [chores]);

  const imageMap = useMemo(() => {
    const m = new Map<number, string>();
    mainImages.forEach((img) => {
      if (img.ChoreId) m.set(img.ChoreId, img.image);
    });
    return m;
  }, [mainImages]);

  function getColor(choreId: number): string {
    const chore = choreMap.get(choreId);
    const catId = chore?.category ?? chore?.Category ?? 0;
    return colorMap.get(catId) ?? '#1d4ed8';
  }

  function handleDrop() {
    setDropOver(false);
    if (dragId == null) return;
    const assignment = todoItems.find((a) => (a.id ?? a.assignmentId) === dragId);
    if (assignment) markDone.mutate(toMarkDonePayload(assignment));
    setDragId(null);
  }

  return (
    <div className="cc-page">
      <div className="cc-header">
        <h1 className="cc-title">
          <span className="cc-title-chore">Chore</span>{' '}
          <span className="cc-title-chart">Chart!</span>
        </h1>
        <p className="cc-subtitle">
          {user?.displayName?.split(' ')[0] ?? 'My'}'s tasks — week {week.thisWeek()}
        </p>
      </div>

      <div className="cc-board">
        {/* TO DO */}
        <div className="cc-column cc-column--todo">
          <div className="cc-col-header cc-col-header--todo">
            <i className="fas fa-clipboard-list" /> To Do
            <span className="cc-col-count">{todoItems.length}</span>
          </div>
          <div className="cc-col-body">
            {todoItems.length === 0 && (
              <div className="cc-empty">
                <i className="fas fa-check-double" />
                <p>All caught up!</p>
              </div>
            )}
            {todoItems.map((a) => (
              <ChoreCard
                key={a.id ?? a.assignmentId}
                assignment={a}
                color={getColor(a.choreId)}
                imageUrl={imageMap.get(a.choreId)}
                done={false}
                draggable
                isDragging={dragId === (a.id ?? a.assignmentId)}
                onDragStart={() => setDragId(a.id ?? a.assignmentId ?? 0)}
                onDragEnd={() => setDragId(null)}
                onComplete={() => markDone.mutate(toMarkDonePayload(a))}
              />
            ))}
          </div>
        </div>

        <div className="cc-divider">
          <i className="fas fa-arrow-right cc-arrow" />
        </div>

        {/* DONE */}
        <div
          className={`cc-column cc-column--done ${dropOver ? 'cc-column--over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDropOver(true); }}
          onDragLeave={() => setDropOver(false)}
          onDrop={handleDrop}
        >
          <div className="cc-col-header cc-col-header--done">
            <i className="fas fa-check-circle" /> Done
            <span className="cc-col-count">{doneItems.length}</span>
          </div>
          <div className="cc-col-body">
            {doneItems.length === 0 && (
              <div className="cc-empty cc-empty--done">
                <i className="fas fa-arrow-left" />
                <p>Drag a task here to complete it</p>
              </div>
            )}
            {doneItems.map((a) => (
              <ChoreCard
                key={a.id ?? a.assignmentId}
                assignment={a}
                color={getColor(a.choreId)}
                imageUrl={imageMap.get(a.choreId)}
                done
                draggable={false}
                isDragging={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ChoreCard ──────────────────────────────────────────────────────────────────

interface CardProps {
  assignment: Assignment;
  color: string;
  imageUrl?: string;
  done: boolean;
  draggable: boolean;
  isDragging: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onComplete?: () => void;
}

function ChoreCard({ assignment, color, imageUrl, done, draggable, isDragging, onDragStart, onDragEnd, onComplete }: CardProps) {
  const name = assignment.chorename ?? `Chore #${assignment.choreId}`;

  return (
    <div
      className={`cc-card ${done ? 'cc-card--done' : ''} ${isDragging ? 'cc-card--dragging' : ''}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="cc-card-accent" style={{ backgroundColor: color }} />

      <div className="cc-card-media">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="cc-card-img" />
        ) : (
          <div className="cc-card-icon" style={{ color }}>
            <i className="fas fa-broom" />
          </div>
        )}
        {done && (
          <div className="cc-card-done-overlay">
            <i className="fas fa-check" />
          </div>
        )}
      </div>

      <div className="cc-card-body">
        <span className="cc-card-name">{name}</span>
        {!done && (
          <button className="cc-card-complete" onClick={onComplete} title="Mark complete">
            <i className="fas fa-check" />
          </button>
        )}
      </div>
    </div>
  );
}
