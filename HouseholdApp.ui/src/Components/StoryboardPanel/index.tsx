import React from 'react';
import type { Chore, ImageRecord } from '../../Types';
import { useImagesByChoreId } from '../../data/imageData';
import { parseSteps } from '../../helpers/parseSteps';
import StepPanel from './StepPanel';

interface Props {
  chore: Chore;
  color: string;
  categoryName: string;
  isAssigned: boolean;
}

export default function StoryboardPanel({ chore, color, categoryName, isAssigned }: Props) {
  const choreId = chore.id ?? chore.Id ?? 0;
  const { data: images = [] } = useImagesByChoreId(choreId);

  const description = chore.description ?? chore.Description ?? '';
  const steps = parseSteps(description);

  // Pair each step with its image by index; remaining images shown below
  const pairedImages: (ImageRecord | undefined)[] = steps.map((_, i) => images[i]);
  const extraImages = images.slice(steps.length);

  return (
    <div className="storyboard-panel" style={{ borderColor: color }}>
      {/* Header */}
      <div className="storyboard-header">
        <h2 className="storyboard-title">{chore.name ?? chore.Name}</h2>
        <div className="storyboard-meta">
          {categoryName && (
            <span className="storyboard-category-chip" style={{ backgroundColor: color }}>
              {categoryName}
            </span>
          )}
          {isAssigned && (
            <span className="storyboard-assigned-badge">● Assigned this week</span>
          )}
        </div>
      </div>

      {/* Filmstrip */}
      {steps.length > 0 ? (
        <div className="storyboard-filmstrip">
          {steps.map((step, i) => (
            <StepPanel
              key={i}
              stepNumber={i + 1}
              text={step}
              image={pairedImages[i]}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>
      ) : (
        <p className="storyboard-empty">No steps added yet.</p>
      )}

      {/* Extra uploaded images that exceed step count */}
      {extraImages.length > 0 && (
        <div className="storyboard-extra-images">
          <div className="storyboard-extra-label">Additional Photos</div>
          <div className="storyboard-extra-strip">
            {extraImages.map((img) => (
              <img key={img.id} src={img.image} alt="" className="storyboard-extra-img" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
