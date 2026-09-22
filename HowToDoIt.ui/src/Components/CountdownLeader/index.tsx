import React from 'react';

// Placeholder art for step frames that have no image. Fills its container
// (16:10 frames); decorative, so aria-hidden.
//
// Two modes:
//   n     — a film "countdown leader": the step number inside concentric rings
//           with registration crosshairs. For a real SOP step whose photo isn't
//           there yet, "3" is the useful thing to say.
//   label — the step's own words, large, on the same crosshair field. The
//           walkthrough's first slide is "Sign in", and a countdown "1" there
//           read as a film leader while saying nothing about the step.
type Props = { n?: number; label?: string };

export default function CountdownLeader({ n, label }: Props) {
  return (
    <svg className="countdown" viewBox="0 0 200 125" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <line className="countdown__cross" x1="100" y1="0" x2="100" y2="125" />
      <line className="countdown__cross" x1="0" y1="62.5" x2="200" y2="62.5" />

      {label ? (
        // No rings behind lettering: they crowd the words and keep the leader look.
        <text
          className="countdown__label"
          x="100"
          y="64"
          textLength="168"
          lengthAdjust="spacingAndGlyphs"
        >
          {label}
        </text>
      ) : (
        <>
          <circle className="countdown__ring" cx="100" cy="62.5" r="55" />
          <circle className="countdown__ring countdown__ring--dashed" cx="100" cy="62.5" r="42" />
          <text className="countdown__num" x="100" y="64">{n}</text>
        </>
      )}
    </svg>
  );
}
