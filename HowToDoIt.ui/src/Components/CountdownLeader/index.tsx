import React from 'react';

// A film "countdown leader" placeholder for steps that have no image: a big step
// number inside concentric rings with registration crosshairs. A graceful
// default that fits the blueprint theme, in place of an empty frame. Fills its
// container (16:10 frames); decorative, so aria-hidden.
export default function CountdownLeader({ n }: { n: number }) {
  return (
    <svg className="countdown" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <line className="countdown__cross" x1="100" y1="0" x2="100" y2="125" />
      <line className="countdown__cross" x1="0" y1="62.5" x2="200" y2="62.5" />

      <circle className="countdown__ring" cx="100" cy="62.5" r="55" />
      <circle className="countdown__ring countdown__ring--dashed" cx="100" cy="62.5" r="42" />

      <text className="countdown__num" x="100" y="64">{n}</text>
    </svg>
  );
}
