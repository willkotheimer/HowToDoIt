import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
  Button, Input, Label, FormGroup, Spinner,
} from 'reactstrap';
import { useSequence, useCreateSequence, useUpdateSequence, useDeleteSequence } from '../../data/sequenceData';
import { useCategories, useAddCategory } from '../../data/categoryData';
import { useCreateStep, useReorderSteps } from '../../data/stepData';
import StepEditor from '../../Components/StepEditor';
import { useAuth } from '../../context/AuthContext';
import type { WorkStep } from '../../Types';

export default function SequenceEditor() {
  const { canWrite } = useAuth();
  const history = useHistory();
  const { id } = useParams<{ id?: string }>();
  const sequenceId = id ? Number(id) : 0;
  const isEdit = sequenceId > 0;

  const { data: sequence, isLoading } = useSequence(sequenceId, isEdit);
  const { data: categories = [] } = useCategories();

  const createSequence = useCreateSequence();
  const updateSequence = useUpdateSequence();
  const deleteSequence = useDeleteSequence();
  const addCategory = useAddCategory();
  const createStep = useCreateStep(sequenceId);
  const reorderSteps = useReorderSteps(sequenceId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [newStepTitle, setNewStepTitle] = useState('');

  // Populate the form once the sequence loads (edit mode).
  useEffect(() => {
    if (sequence) {
      setTitle(sequence.title ?? '');
      setDescription(sequence.description ?? '');
      setCategoryId(sequence.categoryId ?? null);
      setIsPublic(sequence.isPublic);
    }
  }, [sequence]);

  if (!canWrite) return <p className="editor__denied">You do not have permission to edit sequences.</p>;
  if (isEdit && isLoading) return <div className="editor__loading"><Spinner /> Loading…</div>;

  const saveMeta = async () => {
    const payload = { title, description, categoryId, isPublic };
    if (isEdit) {
      await updateSequence.mutateAsync({ id: sequenceId, ...payload });
    } else {
      const created = await createSequence.mutateAsync(payload);
      history.push(`/sequence/${created.id}/edit`);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const created = await addCategory.mutateAsync({ categoryName: newCategory.trim() });
    setCategoryId(created.id);
    setNewCategory('');
  };

  const handleAddStep = async () => {
    if (!isEdit) return;
    await createStep.mutateAsync({ workSequenceId: sequenceId, title: newStepTitle.trim(), description: '' });
    setNewStepTitle('');
  };

  const steps: WorkStep[] = [...(sequence?.steps ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const moveStep = (stepId: number, direction: -1 | 1) => {
    const ids = steps.map((s) => s.id);
    const from = ids.indexOf(stepId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    [ids[from], ids[to]] = [ids[to], ids[from]];
    reorderSteps.mutate(ids);
  };

  const handleDeleteSequence = async () => {
    if (!window.confirm('Delete this entire sequence, its steps and images?')) return;
    await deleteSequence.mutateAsync(sequenceId);
    history.push('/');
  };

  return (
    <div className="editor">
      <h1>{isEdit ? 'Edit Sequence' : 'New Sequence'}</h1>

      <section className="editor__meta">
        <FormGroup>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Change the die on Press #4" />
        </FormGroup>
        <FormGroup>
          <Label>Description</Label>
          <Input type="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label>Category</Label>
          <Input
            type="select"
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
          </Input>
          <div className="editor__new-category">
            <Input
              bsSize="sm"
              placeholder="Add a new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button size="sm" color="light" onClick={handleAddCategory} disabled={!newCategory.trim()}>Add</Button>
          </div>
        </FormGroup>
        <FormGroup check className="mb-3">
          <Label check>
            <Input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />{' '}
            Public (visible in the browse feed)
          </Label>
        </FormGroup>
        <Button color="primary" onClick={saveMeta} disabled={!title.trim() || createSequence.isLoading || updateSequence.isLoading}>
          {isEdit ? 'Save changes' : 'Create & add steps'}
        </Button>
      </section>

      {isEdit && (
        <section className="editor__steps">
          <h2>Steps</h2>
          {steps.map((step, index) => (
            <StepEditor
              key={step.id}
              step={step}
              sequenceId={sequenceId}
              index={index}
              total={steps.length}
              onMove={moveStep}
            />
          ))}

          <div className="editor__add-step">
            <Input
              placeholder="New step title"
              value={newStepTitle}
              onChange={(e) => setNewStepTitle(e.target.value)}
            />
            <Button color="secondary" onClick={handleAddStep} disabled={createStep.isLoading}>+ Add step</Button>
          </div>

          <hr />
          <Button color="danger" outline onClick={handleDeleteSequence}>Delete sequence</Button>
        </section>
      )}
    </div>
  );
}
