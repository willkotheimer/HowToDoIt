import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <div className="site-footer__brand">HowToDoIt</div>
          <p>
            Visual work sequences &mdash; step-by-step image workflows and SOPs for shop-floor
            and service work. Follow along and see exactly what &ldquo;done right&rdquo; looks like.
          </p>
        </div>
        <div>
          <h5>Browse</h5>
          <p>Coffee Shop<br />Retail Store<br />More domains soon</p>
        </div>
        <div>
          <h5>The idea</h5>
          <p>Capture a task once as an ordered set of photos. Anyone can repeat it &mdash; no guesswork, no tribal knowledge.</p>
        </div>
      </div>
      <div className="site-footer__bar">© {new Date().getFullYear()} HowToDoIt</div>
    </footer>
  );
}
