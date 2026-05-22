import { useState, useEffect } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:        #1a1a2e;
    --ink-light:  #4a4a6a;
    --cream:      #f8f5ef;
    --paper:      #fffef9;
    --gold:       #c9a84c;
    --gold-light: #e8d5a3;
    --border:     #ddd8cc;
  }

  .landing-root {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.12) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(26,26,46,0.07) 0%, transparent 50%),
      var(--cream);
    font-family: 'DM Sans', sans-serif;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }

  /* ruled paper lines */
  .landing-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: repeating-linear-gradient(
      transparent, transparent 27px,
      rgba(201,168,76,0.10) 28px
    );
    pointer-events: none;
  }

  /* decorative corner marks */
  .corner {
    position: absolute;
    width: 40px; height: 40px;
    opacity: 0.25;
  }
  .corner-tl { top: 2rem;  left: 2rem;  border-top: 2px solid var(--gold); border-left: 2px solid var(--gold); }
  .corner-tr { top: 2rem;  right: 2rem; border-top: 2px solid var(--gold); border-right: 2px solid var(--gold); }
  .corner-bl { bottom: 2rem; left: 2rem;  border-bottom: 2px solid var(--gold); border-left: 2px solid var(--gold); }
  .corner-br { bottom: 2rem; right: 2rem; border-bottom: 2px solid var(--gold); border-right: 2px solid var(--gold); }

  /* centre content */
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0;
    animation: fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* icon */
  .brand-icon {
    width: 64px; height: 64px;
    background: var(--ink);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.8rem;
    margin-bottom: 1.6rem;
    box-shadow: 0 8px 32px rgba(26,26,46,0.18);
    animation: fadeUp 0.7s 0.1s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* name */
  .brand-name {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2.8rem, 8vw, 5rem);
    color: var(--ink);
    letter-spacing: -0.03em;
    line-height: 1;
    animation: fadeUp 0.7s 0.15s cubic-bezier(0.22,1,0.36,1) both;
  }

  .brand-name em {
    font-style: italic;
    color: var(--gold);
  }

  /* gold rule */
  .rule {
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 1.4rem auto;
    animation: fadeUp 0.7s 0.2s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* tagline */
  .tagline {
    font-size: clamp(0.9rem, 2.5vw, 1.05rem);
    color: var(--ink-light);
    font-weight: 300;
    letter-spacing: 0.04em;
    max-width: 360px;
    line-height: 1.6;
    animation: fadeUp 0.7s 0.25s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* buttons */
  .btn-row {
    display: flex;
    gap: 0.9rem;
    margin-top: 2.4rem;
    flex-wrap: wrap;
    justify-content: center;
    animation: fadeUp 0.7s 0.32s cubic-bezier(0.22,1,0.36,1) both;
  }

  .btn-primary {
    padding: 0.85rem 2.2rem;
    background: var(--ink);
    color: var(--gold-light);
    border: none;
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }

  .btn-primary:hover {
    background: #2c2c4e;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26,26,46,0.22);
  }

  .btn-secondary {
    padding: 0.85rem 2.2rem;
    background: none;
    color: var(--ink);
    border: 1.5px solid var(--border);
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s, transform 0.15s;
  }

  .btn-secondary:hover {
    border-color: var(--gold);
    color: var(--gold);
    transform: translateY(-2px);
  }

  /* three steps hint */
  .steps-hint {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 3rem;
    font-size: 0.75rem;
    color: var(--ink-light);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 500;
    animation: fadeUp 0.7s 0.4s cubic-bezier(0.22,1,0.36,1) both;
  }

  .steps-hint span { opacity: 0.45; }

  .step-chip {
    padding: 0.25rem 0.7rem;
    border: 1px solid var(--border);
    border-radius: 20px;
    background: var(--paper);
    font-size: 0.72rem;
    color: var(--ink-light);
    white-space: nowrap;
  }

  .step-chip.gold {
    border-color: var(--gold-light);
    color: var(--gold);
    background: rgba(201,168,76,0.07);
  }
`;

export default function Landing({ onLogin, onSignup }) {
  useEffect(() => { document.title = "Exam PredictorAI"; }, []);
  return (
    <>
      <style>{styles}</style>
      <div className="landing-root">

        {/* corner decorations */}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div className="center">

          {/* icon */}
          <div className="brand-icon">📄</div>

          {/* name */}
          <div className="brand-name">
            Exam<em>PredictorAI</em>
          </div>

          {/* rule */}
          <div className="rule" />

          {/* tagline */}
          <div className="tagline">
            Upload past exam papers. Let AI find the patterns.
            Download your predicted question paper.
          </div>

          {/* buttons */}
          <div className="btn-row">
            <button className="btn-primary"   onClick={onSignup}>Get Started</button>
            <button className="btn-secondary" onClick={onLogin}>Sign In</button>
          </div>

          {/* flow hint */}
          <div className="steps-hint">
            <div className="step-chip">Upload 3–5 PDFs</div>
            <span>→</span>
            <div className="step-chip gold">AI Analyses</div>
            <span>→</span>
            <div className="step-chip">Download Paper</div>
          </div>

        </div>
      </div>
    </>
  );
}