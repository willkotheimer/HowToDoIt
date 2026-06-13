import React from 'react';
import type { ImageRecord } from '../../Types';

interface Props {
  stepNumber: number;
  text: string;
  image?: ImageRecord;
  isLast: boolean;
}

export default function StepPanel({ stepNumber, text, image, isLast }: Props) {
  return (
    <div className="step-panel-wrapper">
      <div className="step-panel">
        <div className="step-panel-number">Step {stepNumber}</div>

        <div className="step-panel-image-slot">
          {image ? (
            <img src={image.image} alt={`Step ${stepNumber}`} className="step-panel-image" />
          ) : (
            <div className="step-panel-placeholder">
              <span className="step-panel-placeholder-icon">📷</span>
            </div>
          )}
        </div>

        <p className="step-panel-text">{text}</p>
      </div>

      {!isLast && <div className="step-panel-arrow">→</div>}
    </div>
  );
}
