import React from 'react';
import { parseSteps } from '../../helpers/parseSteps';

export default function ChoresInfo({ choreInfo }) {
  const steps = parseSteps(choreInfo.description);
  return (
    <div>
      <div>Name: {choreInfo.name}</div>
      <div>
        Details:
        <ol className="steps">
          {steps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </div>
    </div>
  );
}
