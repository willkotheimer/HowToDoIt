import React, { useMemo } from 'react';
import AppModal from '../../Components/AppModal';
import ChoreForm from '../../Components/Forms/ChoreForm';
import ImageUploader from '../../Components/Forms/ImageUploader';
import { useAuth } from '../../context/AuthContext';
import { useChoresByHousehold } from '../../data/choresData';
import { useCategories } from '../../data/categoryData';
import { useImagesByChoreId } from '../../data/imageData';
import { buildCategoryColorMap } from '../../helpers/categoryColors';
import type { Chore, Category } from '../../Types';

function TaskCardImages({ choreId }: { choreId: number }) {
  const { data: images = [] } = useImagesByChoreId(choreId);
  if (images.length === 0) return null;
  return (
    <div className="task-card-images">
      {images.slice(0, 3).map((img) => (
        <img key={img.id} src={img.image} alt="" className="task-card-thumb" />
      ))}
    </div>
  );
}

function TaskCard({
  chore,
  categories,
  colorMap,
  uid,
}: {
  chore: Chore;
  categories: Category[];
  colorMap: Map<number, string>;
  uid: string;
}) {
  const choreId = chore.id ?? chore.Id ?? 0;
  const catId = chore.category ?? chore.Category;
  const category = categories.find((c) => c.id === catId);
  const color = category ? colorMap.get(category.id) ?? '#1d4ed8' : '#1d4ed8';
  const name = chore.name ?? chore.Name ?? '';
  const desc = chore.description ?? chore.Description ?? '';

  return (
    <div className="task-card">
      <div className="task-card-bar" style={{ backgroundColor: color }} />
      <TaskCardImages choreId={choreId} />
      <div className="task-card-body">
        <div className="task-card-meta">
          {category && (
            <span className="task-card-category" style={{ backgroundColor: color }}>
              {category.categoryName}
            </span>
          )}
        </div>
        <h3 className="task-card-name">{name}</h3>
        {desc && (
          <p className="task-card-desc">
            {desc.slice(0, 90)}{desc.length > 90 ? '…' : ''}
          </p>
        )}
        <div className="task-card-actions">
          <AppModal title="Edit Task" buttonLabel="Edit">
            <ChoreForm choreInfo={chore} uid={uid} />
          </AppModal>
          <AppModal title="Add Photos" buttonLabel="Add Photos" size="lg" fullscreen="md">
            <ImageUploader choreInfo={chore} />
          </AppModal>
        </div>
      </div>
    </div>
  );
}

export default function TaskBoardView() {
  const { uid, householdId } = useAuth();
  const { data: chores = [] } = useChoresByHousehold(householdId);
  const { data: categories = [] } = useCategories();

  const colorMap = useMemo(
    () => buildCategoryColorMap(categories.map((c) => c.id)),
    [categories],
  );

  return (
    <div className="task-board">
      <div className="task-board-header">
        <div>
          <h1 className="task-board-title">Task Board</h1>
          <p className="task-board-subtitle">All household tasks — add, edit, and upload photos</p>
        </div>
        <AppModal title="Add Task" buttonLabel="+ Add Task" btnColor="success">
          <ChoreForm uid={uid} />
        </AppModal>
      </div>

      <div className="task-board-grid">
        {chores.map((chore) => (
          <TaskCard
            key={chore.id ?? chore.Id}
            chore={chore}
            categories={categories}
            colorMap={colorMap}
            uid={uid}
          />
        ))}
        {chores.length === 0 && (
          <p className="task-board-empty">No tasks yet. Add your first task above.</p>
        )}
      </div>
    </div>
  );
}
