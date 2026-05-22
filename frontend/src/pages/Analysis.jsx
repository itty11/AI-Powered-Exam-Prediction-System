import { useState, useEffect, useRef } from "react";

const API = "http://localhost:5000/api";

// ── Styles ────────────────────────────────────────────────────────────────────
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
    --red:        #c0392b;
    --green:      #27ae60;
    --border:     #ddd8cc;
    --shadow:     0 4px 24px rgba(26,26,46,0.10);
  }

  .analysis-root {
    min-height: 100vh;
    width: 100%;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.10) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(26,26,46,0.06) 0%, transparent 50%),
      var(--cream);
    font-family: 'DM Sans', sans-serif;
    padding: 2rem;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .analysis-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: repeating-linear-gradient(
      transparent, transparent 27px,
      rgba(201,168,76,0.10) 28px
    );
    pointer-events: none;
  }

  /* ── Navbar ── */
  .navbar {
    width: 100%;
    max-width: 600px;
    margin-bottom: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-brand {
    font-family: 'DM Serif Display', serif;
    font-size: 1.25rem;
    color: var(--ink);
    letter-spacing: -0.02em;
  }
  .nav-brand em { font-style: italic; color: var(--gold); }

  .nav-user {
    font-size: 0.82rem;
    color: var(--ink-light);
    font-weight: 500;
  }

  /* ── Steps ── */
  .steps {
    width: 100%;
    max-width: 600px;
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--border);
  }
  .step.done   { color: var(--green); }
  .step.active { color: var(--gold); }

  .step-num {
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 1.5px solid currentColor;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem;
    flex-shrink: 0;
  }

  .step-line {
    flex: 1;
    height: 1px;
    background: var(--border);
    margin: 0 0.6rem;
  }

  /* ── Main card ── */
  .card {
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 3px;
    box-shadow: var(--shadow), 0 1px 0 var(--gold-light);
    width: 100%;
    max-width: 600px;
    position: relative;
    animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold));
    border-radius: 3px 3px 0 0;
  }

  /* ── Card header ── */
  .card-header {
    padding: 2rem 2rem 1.5rem;
    text-align: center;
    border-bottom: 1px solid var(--border);
  }

  .header-icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.8rem;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1);    opacity: 1; }
    50%       { transform: scale(1.08); opacity: 0.85; }
  }

  .card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    color: var(--ink);
    letter-spacing: -0.02em;
  }
  .card-title em { font-style: italic; color: var(--gold); }

  .card-sub {
    font-size: 0.83rem;
    color: var(--ink-light);
    margin-top: 0.35rem;
    font-weight: 300;
  }

  /* ── Progress bar ── */
  .progress-wrap {
    padding: 1.8rem 2rem 0;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.5rem;
  }

  .progress-label {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-light);
  }

  .progress-pct {
    font-family: 'DM Serif Display', serif;
    font-size: 1.3rem;
    color: var(--gold);
  }

  .progress-track {
    height: 8px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--gold), var(--gold-light));
    transition: width 0.6s cubic-bezier(0.22,1,0.36,1);
    position: relative;
    overflow: hidden;
  }

  /* shimmer on bar */
  .progress-fill::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255,0.35) 50%,
      transparent 100%
    );
    animation: shimmer 1.4s ease infinite;
  }

  @keyframes shimmer {
    from { transform: translateX(-100%); }
    to   { transform: translateX(200%); }
  }

  /* ── Pipeline steps ── */
  .pipeline {
    padding: 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .pipe-step {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 0.9rem 0;
    border-bottom: 1px solid rgba(221,216,204,0.5);
    transition: opacity 0.3s;
  }
  .pipe-step:last-child { border-bottom: none; }
  .pipe-step.pending  { opacity: 0.35; }
  .pipe-step.active   { opacity: 1; }
  .pipe-step.complete { opacity: 1; }

  .pipe-icon-wrap {
    flex-shrink: 0;
    width: 36px; height: 36px;
    border-radius: 50%;
    border: 1.5px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
    background: var(--cream);
    transition: border-color 0.3s, background 0.3s;
    position: relative;
  }

  .pipe-step.active .pipe-icon-wrap {
    border-color: var(--gold);
    background: rgba(201,168,76,0.08);
  }

  .pipe-step.complete .pipe-icon-wrap {
    border-color: var(--green);
    background: rgba(39,174,96,0.08);
  }

  /* spinning ring for active */
  .pipe-step.active .pipe-icon-wrap::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: var(--gold);
    animation: spin 0.9s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .pipe-text { flex: 1; }

  .pipe-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--ink);
  }

  .pipe-step.pending  .pipe-name { color: var(--ink-light); }
  .pipe-step.active   .pipe-name { color: var(--ink); }
  .pipe-step.complete .pipe-name { color: var(--green); }

  .pipe-desc {
    font-size: 0.78rem;
    color: var(--ink-light);
    margin-top: 0.15rem;
    font-weight: 300;
    line-height: 1.4;
  }

  .pipe-status {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding-top: 0.1rem;
  }

  .pipe-step.pending  .pipe-status { color: var(--border); }
  .pipe-step.active   .pipe-status { color: var(--gold); }
  .pipe-step.complete .pipe-status { color: var(--green); }

  /* ── Elapsed timer ── */
  .timer-row {
    padding: 0 2rem 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .timer-label {
    font-size: 0.75rem;
    color: var(--ink-light);
    font-weight: 300;
    letter-spacing: 0.04em;
  }

  .timer-val {
    font-family: 'DM Serif Display', serif;
    font-size: 1rem;
    color: var(--ink-light);
  }

  /* ── Error state ── */
  .error-body {
    padding: 2rem;
    text-align: center;
    border-top: 1px solid var(--border);
  }

  .error-msg {
    font-size: 0.85rem;
    color: var(--red);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: #fdf0ef;
    border: 1px solid #e8c0bc;
    border-radius: 2px;
    padding: 0.7rem 1rem;
  }

  .retry-btn {
    padding: 0.65rem 1.6rem;
    background: var(--ink);
    color: var(--gold-light);
    border: none;
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s;
  }
  .retry-btn:hover { background: #2c2c4e; }

  /* ── Done state ── */
  .done-body {
    padding: 1.5rem 2rem;
    text-align: center;
    border-top: 1px solid var(--border);
    background: rgba(39,174,96,0.04);
  }

  .done-icon {
    font-size: 2.5rem;
    display: block;
    margin-bottom: 0.6rem;
    animation: popIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes popIn {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  .done-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.15rem;
    color: var(--green);
    margin-bottom: 0.3rem;
  }

  .done-sub {
    font-size: 0.82rem;
    color: var(--ink-light);
    margin-bottom: 1.2rem;
    font-weight: 300;
  }

  .view-btn {
    padding: 0.85rem 2.5rem;
    background: var(--ink);
    color: var(--gold-light);
    border: none;
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .view-btn:hover {
    background: #2c2c4e;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(26,26,46,0.22);
  }

  /* ── Fun fact ticker ── */
  .fact-strip {
    padding: 0.9rem 2rem;
    border-top: 1px solid var(--border);
    background: rgba(201,168,76,0.05);
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
  }

  .fact-label {
    flex-shrink: 0;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--gold);
    padding-top: 0.05rem;
  }

  .fact-text {
    font-size: 0.8rem;
    color: var(--ink-light);
    font-weight: 300;
    line-height: 1.5;
    animation: factIn 0.5s ease both;
  }

  @keyframes factIn {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 600px) {
    .card-header, .progress-wrap, .pipeline,
    .timer-row, .error-body, .done-body, .fact-strip {
      padding-left: 1.2rem;
      padding-right: 1.2rem;
    }
  }
`;

// ── Pipeline step definitions ─────────────────────────────────────────────────
const PIPELINE = [
  {
    icon: "📤",
    name: "Uploading PDFs",
    desc: "Sending your exam papers to the server securely",
    duration: 8,     // % of total progress this step covers
  },
  {
    icon: "📖",
    name: "Extracting Text",
    desc: "Reading and cleaning text from each PDF using PyMuPDF",
    duration: 15,
  },
  {
    icon: "🔍",
    name: "Finding Repeated Questions",
    desc: "Running TF-IDF similarity to cluster matching questions across papers",
    duration: 22,
  },
  {
    icon: "🤖",
    name: "AI Prediction",
    desc: "Sending patterns to HuggingFace — generating your predicted question paper",
    duration: 40,
  },
  {
    icon: "📄",
    name: "Generating PDF",
    desc: "Formatting the predicted paper into a downloadable A4 document",
    duration: 15,
  },
];

const FUN_FACTS = [
  "Questions that appeared in 3+ past papers have a much higher chance of reappearing.",
  "TF-IDF stands for Term Frequency–Inverse Document Frequency — it weighs rare words higher.",
  "The AI reads the full text of every paper before predicting questions.",
  "Cosine similarity measures the angle between two text vectors — 1.0 means identical.",
  "ReportLab has been generating PDFs in Python since 2000.",
  "Most exam boards reuse 30–40% of questions across years with minor rephrasing.",
  "The Mistral-7B model has 7 billion parameters — trained on trillions of tokens.",
  "Your predicted paper is unique to your uploaded papers — no two are the same.",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatElapsed(seconds) {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function getStepState(stepIndex, activeStep) {
  if (stepIndex < activeStep)  return "complete";
  if (stepIndex === activeStep) return "active";
  return "pending";
}

// cumulative progress thresholds per step
const STEP_THRESHOLDS = PIPELINE.reduce((acc, step, i) => {
  const prev = acc[i - 1] ?? 0;
  acc.push(prev + step.duration);
  return acc;
}, []);

function progressToStep(pct) {
  for (let i = 0; i < STEP_THRESHOLDS.length; i++) {
    if (pct <= STEP_THRESHOLDS[i]) return i;
  }
  return PIPELINE.length - 1;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Analysis({ token, user, sessionId, onDone, onError }) {
  const [progress,   setProgress]   = useState(0);
  useEffect(() => { document.title = "Analysing — Exam PredictorAI"; }, []);
  const [status,     setStatus]     = useState("processing"); 
  const [errorMsg,   setErrorMsg]   = useState("");
  const [elapsed,    setElapsed]    = useState(0);
  const [factIndex,  setFactIndex]  = useState(0);

  const pollRef    = useRef(null);
  const timerRef   = useRef(null);
  const factRef    = useRef(null);
  const startTime  = useRef(Date.now());

  // ── Polling ───────────────────────────────────────────────────────────────
  useEffect(() => {
    startPolling();
    startTimer();
    startFactRotation();

    return () => {
      clearInterval(pollRef.current);
      clearInterval(timerRef.current);
      clearInterval(factRef.current);
    };
  }, []);

  function startPolling() {
    // poll immediately then every 3 seconds
    pollStatus();
    pollRef.current = setInterval(pollStatus, 3000);
  }

  async function pollStatus() {
    try {
      const res  = await fetch(`${API}/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status check failed");

      if (data.status === "done") {
        clearInterval(pollRef.current);
        clearInterval(timerRef.current);
        clearInterval(factRef.current);
        setProgress(100);
        setStatus("done");
      } else if (data.status === "failed") {
        clearInterval(pollRef.current);
        clearInterval(timerRef.current);
        setStatus("failed");
        setErrorMsg("Analysis failed on the server. Please try again.");
      } else {
        // still processing — advance fake progress smoothly
        setProgress(p => Math.min(p + 6, 90));
      }
    } catch (err) {
      // network hiccup — don't fail immediately, keep polling
      console.warn("Poll error:", err.message);
    }
  }

  function startTimer() {
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
  }

  function startFactRotation() {
    factRef.current = setInterval(() => {
      setFactIndex(i => (i + 1) % FUN_FACTS.length);
    }, 5000);
  }

  async function handleRetry() {
    setStatus("processing");
    setErrorMsg("");
    setProgress(0);
    startTime.current = Date.now();
    setElapsed(0);

    try {
      const res  = await fetch(`${API}/analyze/${sessionId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Retry failed");
      startPolling();
      startTimer();
    } catch (err) {
      setStatus("failed");
      setErrorMsg(err.message);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeStep  = progressToStep(Math.min(progress, 99));
  const isDone      = status === "done";
  const isFailed    = status === "failed";

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="analysis-root">

        {/* navbar */}
        <nav className="navbar">
          <div className="nav-brand">Exam<em>PredictorAI</em></div>
          <span className="nav-user">👤 {user?.name}</span>
        </nav>

        {/* steps */}
        <div className="steps">
          {[
            { label: "Login",    state: "done" },
            { label: "Upload",   state: "done" },
            { label: "Analyse",  state: isDone ? "done" : "active" },
            { label: "Download", state: isDone ? "done" : "pending" },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div className={`step ${s.state}`}>
                <div className="step-num">
                  {s.state === "done" ? "✓" : i + 1}
                </div>
                <span>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="step-line" />}
            </div>
          ))}
        </div>

        {/* main card */}
        <div className="card">

          {/* header */}
          <div className="card-header">
            <span className="header-icon">
              {isDone ? "🎉" : isFailed ? "⚠️" : "🧠"}
            </span>
            <div className="card-title">
              {isDone   ? <>Analysis <em>Complete!</em></>  :
               isFailed ? <>Analysis <em>Failed</em></>     :
               <>Analysing <em>Your Papers</em></>}
            </div>
            <div className="card-sub">
              {isDone   ? "Your predicted question paper is ready to view and download." :
               isFailed ? "Something went wrong during processing." :
               "Please wait — this usually takes 20 to 60 seconds."}
            </div>
          </div>

          {/* progress bar — hide when done/failed */}
          {!isDone && !isFailed && (
            <div className="progress-wrap">
              <div className="progress-header">
                <span className="progress-label">Progress</span>
                <span className="progress-pct">{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* pipeline steps */}
          {!isDone && !isFailed && (
            <div className="pipeline">
              {PIPELINE.map((step, i) => {
                const state = getStepState(i, activeStep);
                return (
                  <div className={`pipe-step ${state}`} key={i}>
                    <div className="pipe-icon-wrap">{step.icon}</div>
                    <div className="pipe-text">
                      <div className="pipe-name">{step.name}</div>
                      <div className="pipe-desc">{step.desc}</div>
                    </div>
                    <div className="pipe-status">
                      {state === "complete" ? "✓ Done"    :
                       state === "active"   ? "Running…"  :
                       "Waiting"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* elapsed timer */}
          {!isDone && !isFailed && (
            <div className="timer-row">
              <span className="timer-label">Time elapsed</span>
              <span className="timer-val">{formatElapsed(elapsed)}</span>
            </div>
          )}

          {/* error state */}
          {isFailed && (
            <div className="error-body">
              <div className="error-msg">✕ {errorMsg}</div>
              <button className="retry-btn" onClick={handleRetry}>
                Retry Analysis
              </button>
            </div>
          )}

          {/* done state */}
          {isDone && (
            <div className="done-body">
              <span className="done-icon">✅</span>
              <div className="done-title">Paper Ready!</div>
              <div className="done-sub">
                Analysis completed in {formatElapsed(elapsed)} — click below to view results
              </div>
              <button className="view-btn" onClick={() => onDone && onDone(sessionId)}>
                View Results &amp; Download →
              </button>
            </div>
          )}

          {/* fun fact ticker — only while processing */}
          {!isDone && !isFailed && (
            <div className="fact-strip">
              <span className="fact-label">Did you know</span>
              <span className="fact-text" key={factIndex}>
                {FUN_FACTS[factIndex]}
              </span>
            </div>
          )}

        </div>
      </div>
    </>
  );
}