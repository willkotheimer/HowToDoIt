import React, { useState } from 'react';
import {
  Button, Input, Card, CardBody,
} from 'reactstrap';
import AppModal from '../AppModal';
import ImageUploader from '../Forms/ImageUploader';
import { useUpdateStep, useDeleteStep } from '../../data/stepData';
import { useDeleteStepImage, useReorderStepImages } from '../../data/stepImageData';
import { sortBySortOrder, reorderIds } from '../../Helpers/sequenceHelper';
import type { WorkStep } from '../../Types';

interface StepEditorProps {
  step: WorkStep;
  sequenceId: number;
  index: number;
  total: number;
  onMove: (stepId: number, direction: -1 | 1) => void;
}

export default function StepEditor({
  step, sequenceId, index, total, onMove,
}: StepEditorProps) {
  const [title, setTitle] = useState(step.title ?? '');
  const [description, setDescription] = useState(step.description ?? '');

  const updateStep = useUpdateStep(sequenceId);
  const deleteStep = useDeleteStep(sequenceId);
  const deleteImage = useDeleteStepImage(sequenceId);
  const reorderImages = useReorderStepImages(sequenceId);

  const images = sortBySortOrder(step.images);

  const saveDetails = () => updateStep.mutate({ id: step.id, workSequenceId: sequenceId, title, description });

  const moveImage = (imageId: number, direction: -1 | 1) => {
    const next = reorderIds(images.map((im) => im.id), imageId, direction);
    if (next) reorderImages.mutate(next);
  };

  return (
    <Card className="step-editor">
      <CardBody>
        <div className="step-editor__head">
          <span className="step-editor__number">Step {index + 1}</span>
          <div className="step-editor__move">
            <Button size="sm" color="light" disabled={index === 0} onClick={() => onMove(step.id, -1)}>↑</Button>
            <Button size="sm" color="light" disabled={index === total - 1} onClick={() => onMove(step.id, 1)}>↓</Button>
          </div>
        </div>

        <Input
          className="mb-2"
          placeholder="Step title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveDetails}
        />
        <Input
          type="textarea"
          className="mb-2"
          placeholder="Step description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveDetails}
        />

        <div className="step-editor__images">
          {images.map((img, i) => (
            <div key={img.id} className="step-editor__thumb">
              <img src={img.imageUrl} alt={title || `Step ${index + 1}`} />
              <div className="step-editor__thumb-actions">
                <button type="button" onClick={() => moveImage(img.id, -1)} disabled={i === 0} aria-label="Move left">‹</button>
                <button type="button" onClick={() => moveImage(img.id, 1)} disabled={i === images.length - 1} aria-label="Move right">›</button>
                <button type="button" className="danger" onClick={() => deleteImage.mutate(img.id)} aria-label="Delete image">✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="step-editor__foot">
          <AppModal
            title="Add Images"
            buttonLabel="Add Images"
            size="lg"
            btnColor="secondary"
            className="add-images-modal"
          >
            <ImageUploader stepId={step.id} sequenceId={sequenceId} />
          </AppModal>
          <Button
            size="sm"
            color="danger"
            onClick={() => { if (window.confirm('Delete this step and its images?')) deleteStep.mutate(step.id); }}
          >
            Delete step
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
