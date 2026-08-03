import React from 'react';
import './ComparisonSection.css';

const transformations = [
  {
    num: '01',
    usual: "You wonder what's still available.",
    lhPrefix: "Tonight's menu is ",
    lhEm: "already waiting.",
    lhSuffix: ''
  },
  {
    num: '02',
    usual: "Find out after you arrive.",
    lhPrefix: "Know ",
    lhEm: "before you reserve.",
    lhSuffix: ''
  },
  {
    num: '03',
    usual: "Explain your preferences again.",
    lhPrefix: "We ",
    lhEm: "remember them ",
    lhSuffix: "for next time."
  },
  {
    num: '04',
    usual: "Arrive wondering what's special.",
    lhPrefix: "",
    lhEm: "Discover tonight ",
    lhSuffix: "before you arrive."
  }
];

const ComparisonSection = () => {
  return (
    <section className="section lh-difference-section" aria-labelledby="lh-diff-heading">
      {/* Warm Ambient Illumination Layer (Right side focus) */}
      <div className="lh-diff-bg-ambient" aria-hidden="true" />
      <div className="lh-diff-glow-right" aria-hidden="true" />

      <div className="lh-diff-container">
        {/* Section Editorial Header */}
        <header className="lh-diff-header">
          <span className="lh-diff-eyebrow">The Lighthouse Difference</span>
          <h2 id="lh-diff-heading" className="lh-diff-title">
            An evening,<br />
            <em>without the unknown.</em>
          </h2>
          <p className="lh-diff-subtitle">
            A more considered dining experience — from the moment you reserve to the moment you arrive.
          </p>
          <div className="lh-diff-live-indicator">
            <span className="lh-diff-live-dot" aria-hidden="true" />
            <span className="lh-diff-live-text">Tonight's menu is live</span>
          </div>
        </header>

        {/* Editorial Transformation Journey */}
        <div className="lh-diff-journey">
          {/* Top Column Labels (Appears ONCE above the columns) */}
          <div className="lh-diff-col-headers" aria-hidden="true">
            <div className="lh-col-head left-head">The Conventional Way</div>
            <div className="lh-col-head axis-head"></div>
            <div className="lh-col-head right-head">With The Lighthouse</div>
          </div>

          {/* Continuous Vertical Transformation Axis */}
          <div className="lh-diff-timeline-axis" aria-hidden="true" />

          {/* Experience Moments */}
          <div className="lh-diff-moments" role="list">
            {transformations.map((item) => (
              <div key={item.num} className="lh-diff-moment-row" role="listitem">
                {/* Subtle Hover Highlight */}
                <div className="lh-diff-moment-hover-bg" aria-hidden="true" />

                {/* Left Column: The Conventional Way */}
                <div className="lh-diff-left-col">
                  <p className="lh-diff-usual-text">{item.usual}</p>
                </div>

                {/* Central Axis Node & Directional Indicator */}
                <div className="lh-diff-axis-node">
                  <div className="lh-diff-node-circle">
                    <span className="lh-diff-node-num">{item.num}</span>
                  </div>
                  <div className="lh-diff-indicator-arrow" aria-hidden="true">
                    <svg viewBox="0 0 28 12" fill="none" stroke="currentColor">
                      <path d="M0 6H24M19 1L24 6L19 11" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Right Column: With The Lighthouse */}
                <div className="lh-diff-right-col">
                  <p className="lh-diff-lh-text">
                    {item.lhPrefix}
                    <em>{item.lhEm}</em>
                    {item.lhSuffix}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Closing Editorial Statement */}
          <footer className="lh-diff-footer">
            <div className="lh-diff-footer-line" aria-hidden="true">
              <span className="lh-diff-footer-diamond" />
            </div>
            <span className="lh-diff-footer-eyebrow">From Reservation to Arrival</span>
            <h3 className="lh-diff-footer-quote">
              Nothing left to wonder about.
            </h3>
          </footer>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
