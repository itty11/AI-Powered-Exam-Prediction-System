import { useState, useRef, useCallback } from "react";

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

  .upload-root {
    min-height: 100vh;
    width: 100%;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.10) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(26,26,46,0.06) 0%, transparent 50%),
      var(--cream);
    font-family: 'DM Sans', sans-serif;
    padding: 2rem;
    position: relative;
  }

  .upload-root::before {
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
    max-width: 760px;
    margin: 0 auto 2rem;
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

  .nav-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .nav-user {
    font-size: 0.82rem;
    color: var(--ink-light);
    font-weight: 500;
  }

  .logout-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 0.35rem 0.8rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ink-light);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }

  .logout-btn:hover { border-color: var(--ink); color: var(--ink); }

  /* ── Card ── */
  .card {
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 3px;
    box-shadow: var(--shadow), 0 1px 0 var(--gold-light);
    max-width: 760px;
    margin: 0 auto;
    position: relative;
    animation: cardIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(20px); }
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

  .card-header {
    padding: 2rem 2.5rem 1.5rem;
    border-bottom: 1px solid var(--border);
  }

  .card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.5rem;
    color: var(--ink);
    letter-spacing: -0.02em;
  }

  .card-title em { font-style: italic; color: var(--gold); }

  .card-sub {
    font-size: 0.85rem;
    color: var(--ink-light);
    margin-top: 0.3rem;
    font-weight: 300;
  }

  /* ── Steps indicator ── */
  .steps {
    display: flex;
    align-items: center;
    gap: 0;
    margin-top: 1.2rem;
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

  .step.active { color: var(--gold); }
  .step.done   { color: var(--green); }

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
    max-width: 48px;
  }

  /* ── Drop zone ── */
  .drop-zone {
    margin: 2rem 2.5rem 0;
    border: 2px dashed var(--border);
    border-radius: 3px;
    padding: 3rem 2rem;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    position: relative;
  }

  .drop-zone:hover,
  .drop-zone.dragover {
    border-color: var(--gold);
    background: rgba(201,168,76,0.04);
  }

  .drop-zone.dragover .drop-icon { transform: scale(1.15) translateY(-4px); }

  .drop-icon {
    font-size: 2.8rem;
    display: block;
    margin-bottom: 0.8rem;
    transition: transform 0.2s;
  }

  .drop-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.15rem;
    color: var(--ink);
    margin-bottom: 0.4rem;
  }

  .drop-sub {
    font-size: 0.82rem;
    color: var(--ink-light);
    font-weight: 300;
  }

  .drop-sub strong {
    color: var(--gold);
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .file-input { display: none; }

  /* ── File count badge ── */
  .count-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 1rem;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    background: var(--cream);
    border: 1px solid var(--border);
    color: var(--ink-light);
  }

  .count-badge.valid {
    background: #edfbf3;
    border-color: #b7e5c8;
    color: var(--green);
  }

  .count-badge.invalid {
    background: #fdf0ef;
    border-color: #e8c0bc;
    color: var(--red);
  }

  /* ── File list ── */
  .file-list {
    margin: 1.5rem 2.5rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    animation: listIn 0.3s ease both;
  }

  @keyframes listIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .file-list-title {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-light);
    margin-bottom: 0.2rem;
  }

  .file-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.9rem;
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 2px;
    animation: rowIn 0.25s ease both;
  }

  @keyframes rowIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .file-row:nth-child(2) { animation-delay: 0.04s; }
  .file-row:nth-child(3) { animation-delay: 0.08s; }
  .file-row:nth-child(4) { animation-delay: 0.12s; }
  .file-row:nth-child(5) { animation-delay: 0.16s; }

  .file-icon {
    font-size: 1.2rem;
    flex-shrink: 0;
  }

  .file-info {
    flex: 1;
    min-width: 0;
  }

  .file-name {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-size {
    font-size: 0.75rem;
    color: var(--ink-light);
    font-weight: 300;
  }

  .file-remove {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ink-light);
    font-size: 1rem;
    line-height: 1;
    padding: 0.2rem;
    border-radius: 2px;
    transition: color 0.2s, background 0.2s;
    flex-shrink: 0;
  }

  .file-remove:hover { color: var(--red); background: #fdf0ef; }

  /* ── Info row ── */
  .info-row {
    margin: 1.5rem 2.5rem 0;
    padding: 0.7rem 1rem;
    background: rgba(201,168,76,0.07);
    border: 1px solid var(--gold-light);
    border-radius: 2px;
    font-size: 0.82rem;
    color: var(--ink-light);
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .info-row span { flex: 1; line-height: 1.5; }

  /* ── Error banner ── */
  .banner {
    margin: 1rem 2.5rem 0;
    padding: 0.65rem 0.9rem;
    border-radius: 2px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: rowIn 0.25s ease both;
  }

  .banner.error {
    background: #fdf0ef;
    border: 1px solid #e8c0bc;
    color: var(--red);
  }

  /* ── Actions ── */
  .actions {
    padding: 2rem 2.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .submit-btn {
    flex: 1;
    padding: 0.9rem;
    background: var(--ink);
    color: var(--gold-light);
    border: none;
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  }

  .submit-btn:hover:not(:disabled) {
    background: #2c2c4e;
    box-shadow: 0 4px 16px rgba(26,26,46,0.25);
    transform: translateY(-1px);
  }

  .submit-btn:active:not(:disabled) { transform: translateY(0); }

  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .clear-btn {
    padding: 0.9rem 1.4rem;
    background: none;
    border: 1px solid var(--border);
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--ink-light);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }

  .clear-btn:hover { border-color: var(--red); color: var(--red); }

  .spinner {
    display: inline-block;
    width: 13px; height: 13px;
    border: 2px solid rgba(232,213,163,0.3);
    border-top-color: var(--gold-light);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Progress overlay ── */
  .progress-overlay {
    position: fixed;
    inset: 0;
    background: rgba(26,26,46,0.55);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    animation: fadeIn 0.2s ease both;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .progress-card {
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 2.5rem 3rem;
    text-align: center;
    max-width: 340px;
    width: 90%;
    box-shadow: var(--shadow);
    animation: cardIn 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }

  .progress-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.2rem;
    color: var(--ink);
    margin-bottom: 0.4rem;
  }

  .progress-sub {
    font-size: 0.82rem;
    color: var(--ink-light);
    margin-bottom: 1.5rem;
    font-weight: 300;
  }

  .progress-track {
    height: 6px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 0.6rem;
  }

  .progress-fill {
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(90deg, var(--gold), var(--gold-light));
    transition: width 0.5s ease;
  }

  .progress-pct {
    font-size: 0.78rem;
    color: var(--gold);
    font-weight: 600;
  }

  .progress-steps {
    margin-top: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .progress-step {
    font-size: 0.8rem;
    color: var(--ink-light);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-align: left;
  }

  .progress-step.done-step  { color: var(--green); }
  .progress-step.active-step { color: var(--ink); font-weight: 500; }

  /* responsive */
  @media (max-width: 600px) {
    .card-header, .drop-zone, .file-list,
    .info-row, .banner, .actions {
      padding-left: 1.2rem;
      padding-right: 1.2rem;
    }
    .drop-zone { margin-left: 1.2rem; margin-right: 1.2rem; }
    .file-list { margin-left: 1.2rem; margin-right: 1.2rem; }
    .info-row  { margin-left: 1.2rem; margin-right: 1.2rem; }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const PIPELINE_STEPS = [
  "Uploading PDFs…",
  "Extracting text…",
  "Finding repeated questions…",
  "Predicting with AI…",
  "Generating PDF…",
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function Upload({ token, user, onLogout, onDone }) {
  const [files,    setFiles]    = useState([]);
  const [dragover, setDragover] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [progress, setProgress] = useState(0);   // 0-100
  const [stepIdx,  setStepIdx]  = useState(-1);  // which pipeline step
  const fileInputRef = useRef();

  // ── File validation & add ─────────────────────────────────────────────────
  function addFiles(incoming) {
    setError("");
    const pdfs = Array.from(incoming).filter(f => f.type === "application/pdf");

    if (pdfs.length !== incoming.length) {
      setError("Only PDF files are accepted.");
    }

    setFiles(prev => {
      const combined = [...prev, ...pdfs];
      if (combined.length > 5) {
        setError("Maximum 5 PDFs allowed. Extra files were ignored.");
        return combined.slice(0, 5);
      }
      return combined;
    });
  }

  function removeFile(index) {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError("");
  }

  function clearAll() {
    setFiles([]);
    setError("");
  }

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onDragOver  = useCallback(e => { e.preventDefault(); setDragover(true);  }, []);
  const onDragLeave = useCallback(e => { e.preventDefault(); setDragover(false); }, []);
  const onDrop      = useCallback(e => {
    e.preventDefault();
    setDragover(false);
    addFiles(e.dataTransfer.files);
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (files.length < 3) {
      setError("Please upload at least 3 PDF files.");
      return;
    }
    setError("");
    setLoading(true);
    setProgress(0);
    setStepIdx(0);

    try {
      // Step 1 — upload PDFs
      const formData = new FormData();
      files.forEach(f => formData.append("pdfs", f));

      setProgress(10); setStepIdx(0);

      const uploadRes = await fetch(`${API}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      const sessionId = uploadData.session_id;
      setProgress(30); setStepIdx(1);

      // Step 2 — trigger analysis (extraction + question finding + AI + PDF gen)
      const analyzeRes = await fetch(`${API}/analyze/${sessionId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setProgress(50); setStepIdx(2);

      // simulate progress steps while backend works
      await tick(800);  setProgress(65); setStepIdx(3);
      await tick(1000); setProgress(82); setStepIdx(4);

      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analysis failed");

      setProgress(100); setStepIdx(5);
      await tick(600);

      // hand off session ID to parent (App.jsx will show Result page)
      onDone && onDone(sessionId);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(0);
      setStepIdx(-1);
    }
  }

  function tick(ms) { return new Promise(r => setTimeout(r, ms)); }

  const isValid = files.length >= 3 && files.length <= 5;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="upload-root">

        {/* navbar */}
        <nav className="navbar">
          <div className="nav-brand">Exam<em>PredictorAI</em></div>
          <div className="nav-right">
            <span className="nav-user">👤 {user?.name}</span>
            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </nav>

        <div className="card">

          {/* header */}
          <div className="card-header">
            <div className="card-title">Upload <em>Past Papers</em></div>
            <div className="card-sub">
              Upload 3 to 5 previous exam PDFs — the AI will find patterns and predict questions.
            </div>

            {/* steps */}
            <div className="steps">
              <div className="step done">
                <div className="step-num">✓</div>
                <span>Login</span>
              </div>
              <div className="step-line" />
              <div className="step active">
                <div className="step-num">2</div>
                <span>Upload</span>
              </div>
              <div className="step-line" />
              <div className="step">
                <div className="step-num">3</div>
                <span>Analyse</span>
              </div>
              <div className="step-line" />
              <div className="step">
                <div className="step-num">4</div>
                <span>Download</span>
              </div>
            </div>
          </div>

          {/* drop zone */}
          <div
            className={`drop-zone ${dragover ? "dragover" : ""}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="file-input"
              onChange={e => addFiles(e.target.files)}
            />
            <span className="drop-icon">📂</span>
            <div className="drop-title">Drag &amp; drop your PDFs here</div>
            <div className="drop-sub">
              or <strong>browse files</strong> &nbsp;·&nbsp; PDF only &nbsp;·&nbsp; Max 5 files
            </div>

            {/* file count badge */}
            {files.length > 0 && (
              <div className={`count-badge ${isValid ? "valid" : "invalid"}`}>
                {isValid ? "✓" : "✕"}
                &nbsp;{files.length} / 5 files selected
                {files.length < 3 && ` — need ${3 - files.length} more`}
              </div>
            )}
          </div>

          {/* file list */}
          {files.length > 0 && (
            <div className="file-list">
              <div className="file-list-title">Selected Files</div>
              {files.map((file, i) => (
                <div className="file-row" key={`${file.name}-${i}`}>
                  <span className="file-icon">📄</span>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{formatBytes(file.size)}</div>
                  </div>
                  <button
                    className="file-remove"
                    title="Remove"
                    onClick={e => { e.stopPropagation(); removeFile(i); }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {/* info tip */}
          <div className="info-row">
            <span>💡</span>
            <span>
              For best results, upload papers from different years of the <strong>same subject</strong>.
              The AI identifies questions that repeat across years and uses them to predict likely exam questions.
            </span>
          </div>

          {/* error */}
          {error && (
            <div className="banner error">✕ {error}</div>
          )}

          {/* actions */}
          <div className="actions">
            {files.length > 0 && (
              <button className="clear-btn" onClick={clearAll}>
                Clear All
              </button>
            )}
            <button
              className="submit-btn"
              disabled={!isValid || loading}
              onClick={handleSubmit}
            >
              {loading
                ? <><span className="spinner" />Analysing…</>
                : `Analyse ${files.length > 0 ? files.length : ""} Papers →`
              }
            </button>
          </div>

        </div>
      </div>

      {/* progress overlay */}
      {loading && (
        <div className="progress-overlay">
          <div className="progress-card">
            <div className="progress-title">Analysing Papers</div>
            <div className="progress-sub">This may take 20–40 seconds</div>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-pct">{progress}%</div>

            <div className="progress-steps">
              {PIPELINE_STEPS.map((label, i) => (
                <div
                  key={i}
                  className={`progress-step ${
                    i < stepIdx  ? "done-step"   :
                    i === stepIdx ? "active-step" : ""
                  }`}
                >
                  <span>
                    {i < stepIdx  ? "✓" :
                     i === stepIdx ? "⟳" : "○"}
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}