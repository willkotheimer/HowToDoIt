import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import { useSequence } from '../../data/sequenceData';
import { useAuth } from '../../context/AuthContext';

// Quarter-circle dashed guide arrow (vertical tangent -> horizontal chevron
// pointing at the image). Direction flips per row via CSS.
function StepArrow() {
  return (
    <svg className="sop__arrow" viewBox="0 0 58 52" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 46 C 6 23.9 23.9 6 46 6" strokeDasharray="2 11" />
      <path d="M40 0 L48 6 L40 12" />
    </svg>
  );
}

export default function SequenceDetail() {
  const { canWrite } = useAuth();
  const { id } = useParams<{ id: string }>();
  const sequenceId = Number(id);
  const { data: sequence, isLoading, error } = useSequence(sequenceId);

  if (isLoading) return <div className="sop-page"><Spinner /> Loading…</div>;
  if (error || !sequence) return <p className="sop-page">Sequence not found.</p>;

  const steps = [...(sequence.steps ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div className="sop-page">
      <div className="crumb">
        <Link to="/">Browse</Link>
        {sequence.domain && <><span>/</span><Link to="/">{sequence.domain}</Link></>}
        <span>/</span>
        <span className="crumb__current">{sequence.title}</span>
      </div>
      <div className="sop-panel">
        <header className="sop-header">
          <div>
            {sequence.category?.categoryName && (
              <span className="sop-header__category">{sequence.category.categoryName}</span>
            )}
            <h1>{sequence.title}</h1>
          </div>
          {canWrite && (
            <Link to={`/sequence/${sequence.id}/edit`} className="btn btn-outline-light">Edit</Link>
          )}
        </header>

        {sequence.description && <p className="sop-intro">{sequence.description}</p>}
        {steps.length === 0 && <p className="sop-intro">This sequence has no steps yet.</p>}

        <ol className="sop">
          {steps.map((step, index) => {
            const images = [...(step.images ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
            const cover = images[0];
            return (
              <li key={step.id} className="sop__step">
                <div className="sop__media">
                  <span className="badge">{index + 1}</span>
                  {cover ? (
                    <div className="frame"><img className="frame__img" src={cover.imageUrl} alt={step.title ?? `Step ${index + 1}`} /></div>
                  ) : (
                    <div className="frame frame--empty">No image</div>
                  )}
                </div>
                <div className="sop__text">
                  <StepArrow />
                  <p className="sop__num-label">Step {index + 1}</p>
                  <h3 className="sop__title">{step.title || `Step ${index + 1}`}</h3>
                  {step.description && <p className="sop__desc">{step.description}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
