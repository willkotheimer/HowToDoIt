import React from 'react';

export default function ChoresInfo({ choreInfo }) {
  return (
    <div>
        <div>Name: {choreInfo.name} </div>
        <div>Details: <ol className="steps">{choreInfo.description
        && choreInfo.description.split(/[.]/).filter((entity) => {
          if (isNaN(entity)) {
            return true;
          }
          return false;
        }).map((thing) => (<li>{thing}</li>))} </ol></div>
    </div>
  );
}
