import React from 'react';

export default function ChoresLeft({ choresLeft }) {
  const myChores = choresLeft.map((chore) => (
      <div className="choresLeftItem">
         <span>{chore.name}</span>
      </div>
  ));
  return (
    <div className="choresLeft">
        { choresLeft && myChores() }
    </div>
  );
}
