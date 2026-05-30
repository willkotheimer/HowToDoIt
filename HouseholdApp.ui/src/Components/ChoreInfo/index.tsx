import React from 'react';
import { parseChoreDescription } from '../../helpers/ChoreInfoHelper';

export default function ChoresInfo({ choreInfo }) {
  return (
    <div>
        <div>Name: {choreInfo.name} </div>
        <div>Details: <ol className="steps">{choreInfo.description
        && parseChoreDescription(choreInfo.description).map((step) => (<li>{step}</li>))} </ol></div>
    </div>
  );
}
