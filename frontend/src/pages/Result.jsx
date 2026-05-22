import { useState, useEffect } from "react";

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

  .result-root {
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

  .result-root::before {
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
    max-width: 900px;
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

  .nav-btn {
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
  .nav-btn:hover { border-color: var(--ink); color: var(--ink); }

  /* ── Page layout ── */
  .page-wrap {
    max-width: 900px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    animation: pageIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes pageIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Card base ── */
  .card {
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 3px;
    box-shadow: var(--shadow), 0 1px 0 var(--gold-light);
    position: relative;
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
    padding: 1.5rem 2rem;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .card-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.25rem;
    color: var(--ink);
    letter-spacing: -0.02em;
  }
  .card-title em { font-style: italic; color: var(--gold); }

  .card-sub {
    font-size: 0.8rem;
    color: var(--ink-light);
    margin-top: 0.2rem;
    font-weight: 300;
  }

  /* ── Steps bar ── */
  .steps {
    display: flex;
    align-items: center;
    gap: 0;
    max-width: 900px;
    margin: 0 auto 1.5rem;
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

  /* ── Loading state ── */
  .loading-wrap {
    padding: 4rem 2rem;
    text-align: center;
  }

  .big-spinner {
    width: 40px; height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--gold);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .loading-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.1rem;
    color: var(--ink);
  }

  .loading-sub {
    font-size: 0.82rem;
    color: var(--ink-light);
    margin-top: 0.3rem;
    font-weight: 300;
  }

  /* ── Error state ── */
  .error-wrap {
    padding: 3rem 2rem;
    text-align: center;
  }

  .error-icon { font-size: 2.5rem; margin-bottom: 0.8rem; }

  .error-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.1rem;
    color: var(--red);
    margin-bottom: 0.4rem;
  }

  .error-msg {
    font-size: 0.85rem;
    color: var(--ink-light);
    margin-bottom: 1.5rem;
  }

  .retry-btn {
    padding: 0.6rem 1.4rem;
    background: var(--ink);
    color: var(--gold-light);
    border: none;
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s;
  }
  .retry-btn:hover { background: #2c2c4e; }

  /* ── Summary strip ── */
  .summary-strip {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-bottom: 1px solid var(--border);
  }

  .stat-cell {
    padding: 1.2rem 1.5rem;
    text-align: center;
    border-right: 1px solid var(--border);
  }
  .stat-cell:last-child { border-right: none; }

  .stat-num {
    font-family: 'DM Serif Display', serif;
    font-size: 2rem;
    color: var(--gold);
    line-height: 1;
  }

  .stat-label {
    font-size: 0.72rem;
    color: var(--ink-light);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-top: 0.3rem;
    font-weight: 600;
  }

  /* ── Repeated questions ── */
  .repeated-body { padding: 1.5rem 2rem; }

  .rep-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .rep-row {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 2px;
    animation: rowIn 0.3s ease both;
  }

  @keyframes rowIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .rep-row:nth-child(2)  { animation-delay: 0.04s; }
  .rep-row:nth-child(3)  { animation-delay: 0.08s; }
  .rep-row:nth-child(4)  { animation-delay: 0.12s; }
  .rep-row:nth-child(5)  { animation-delay: 0.16s; }
  .rep-row:nth-child(6)  { animation-delay: 0.20s; }

  .rep-badge {
    flex-shrink: 0;
    min-width: 36px;
    padding: 0.2rem 0.5rem;
    background: var(--ink);
    color: var(--gold-light);
    border-radius: 20px;
    font-size: 0.7rem;
    font-weight: 700;
    text-align: center;
    letter-spacing: 0.03em;
  }

  .rep-text {
    flex: 1;
    font-size: 0.88rem;
    color: var(--ink);
    line-height: 1.5;
  }

  .rep-variants {
    margin-top: 0.3rem;
    font-size: 0.78rem;
    color: var(--ink-light);
    font-style: italic;
    font-weight: 300;
  }

  .show-more-btn {
    margin-top: 0.8rem;
    width: 100%;
    padding: 0.55rem;
    background: none;
    border: 1px dashed var(--border);
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: var(--ink-light);
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .show-more-btn:hover { border-color: var(--gold); color: var(--gold); }

  /* ── Predicted paper ── */
  .paper-body { padding: 0; }

  .paper-meta {
    padding: 1.2rem 2rem;
    background: var(--ink);
    color: var(--gold-light);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
    border-radius: 0 0 0 0;
  }

  .paper-subject {
    font-family: 'DM Serif Display', serif;
    font-size: 1.1rem;
    font-style: italic;
  }

  .paper-info {
    font-size: 0.78rem;
    opacity: 0.75;
    letter-spacing: 0.04em;
    text-align: right;
  }

  .section-block { border-bottom: 1px solid var(--border); }
  .section-block:last-child { border-bottom: none; }

  .section-title-bar {
    padding: 0.75rem 2rem;
    background: rgba(201,168,76,0.08);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .section-name {
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--ink);
  }

  .section-inst {
    font-size: 0.75rem;
    color: var(--ink-light);
    font-style: italic;
  }

  .question-list { padding: 0.5rem 2rem 1rem; }

  .q-row {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.65rem 0;
    border-bottom: 1px solid rgba(221,216,204,0.5);
  }
  .q-row:last-child { border-bottom: none; }

  .q-num {
    flex-shrink: 0;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--gold);
    min-width: 24px;
    padding-top: 0.1rem;
  }

  .q-text {
    flex: 1;
    font-size: 0.9rem;
    color: var(--ink);
    line-height: 1.55;
  }

  .q-marks {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--ink-light);
    background: var(--cream);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 0.15rem 0.45rem;
    white-space: nowrap;
  }

  /* ── Download strip ── */
  .download-strip {
    padding: 1.5rem 2rem;
    background: var(--cream);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
    border-radius: 0 0 3px 3px;
  }

  .dl-info { font-size: 0.82rem; color: var(--ink-light); }
  .dl-info strong { color: var(--ink); }

  .dl-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1.8rem;
    background: var(--ink);
    color: var(--gold-light);
    border: none;
    border-radius: 2px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
  }

  .dl-btn:hover:not(:disabled) {
    background: #2c2c4e;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(26,26,46,0.25);
  }
  .dl-btn:active:not(:disabled) { transform: translateY(0); }
  .dl-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .new-btn {
    padding: 0.8rem 1.4rem;
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
  .new-btn:hover { border-color: var(--gold); color: var(--gold); }

  .spinner {
    display: inline-block;
    width: 13px; height: 13px;
    border: 2px solid rgba(232,213,163,0.3);
    border-top-color: var(--gold-light);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    vertical-align: middle;
  }

  /* ── Success toast ── */
  .toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--ink);
    color: var(--gold-light);
    padding: 0.8rem 1.4rem;
    border-radius: 3px;
    font-size: 0.85rem;
    font-weight: 500;
    box-shadow: var(--shadow);
    animation: toastIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
    z-index: 200;
  }

  @keyframes toastIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* responsive */
  @media (max-width: 600px) {
    .summary-strip { grid-template-columns: 1fr 1fr; }
    .stat-cell:nth-child(3) { grid-column: span 2; border-right: none; border-top: 1px solid var(--border); }
    .card-header, .repeated-body, .question-list,
    .paper-meta, .section-title-bar, .download-strip { padding-left: 1.2rem; padding-right: 1.2rem; }
  }
`;

// ── Component ─────────────────────────────────────────────────────────────────
export default function Result({ token, user, sessionId, onLogout, onNewSession }) {
  const [data,        setData]        = useState(null);   // session data from API
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [downloading, setDownloading] = useState(false);
  const [showAll,     setShowAll]     = useState(false);  // show all repeated Qs
  const [toast,       setToast]       = useState("");

  // ── Fetch session on mount ─────────────────────────────────────────────────
  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  async function fetchSession() {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load results");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Download PDF ──────────────────────────────────────────────────────────
  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`${API}/download/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `predicted_paper_${sessionId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      showToast("✓ Download started!");
    } catch (err) {
      showToast("✕ Download failed — " + err.message);
    } finally {
      setDownloading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const paper       = data?.paper;
  const repeatedQs  = data?.repeated_qs  || [];
  const pdfCount    = data?.pdf_count    || 0;
  const metadata    = paper?.metadata    || {};
  const sections    = paper?.sections    || [];

  const totalQs     = sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0);
  const visibleReps = showAll ? repeatedQs : repeatedQs.slice(0, 5);

  // ── Render: loading ───────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{styles}</style>
      <div className="result-root">
        <nav className="navbar">
          <div className="nav-brand">Exam<em>PredictorAI</em></div>
          <div className="nav-right">
            <span className="nav-user">👤 {user?.name}</span>
            <button className="nav-btn" onClick={onLogout}>Logout</button>
          </div>
        </nav>
        <div className="page-wrap">
          <div className="card">
            <div className="loading-wrap">
              <div className="big-spinner" />
              <div className="loading-title">Loading your results…</div>
              <div className="loading-sub">Fetching the predicted question paper</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── Render: error ─────────────────────────────────────────────────────────
  if (error) return (
    <>
      <style>{styles}</style>
      <div className="result-root">
        <nav className="navbar">
          <div className="nav-brand">Exam<em>PredictorAI</em></div>
          <div className="nav-right">
            <span className="nav-user">👤 {user?.name}</span>
            <button className="nav-btn" onClick={onLogout}>Logout</button>
          </div>
        </nav>
        <div className="page-wrap">
          <div className="card">
            <div className="error-wrap">
              <div className="error-icon">⚠️</div>
              <div className="error-title">Something went wrong</div>
              <div className="error-msg">{error}</div>
              <button className="retry-btn" onClick={fetchSession}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── Render: results ───────────────────────────────────────────────────────
  return (
    <>
      <style>{styles}</style>
      <div className="result-root">

        {/* navbar */}
        <nav className="navbar">
          <div className="nav-brand">Exam<em>PredictorAI</em></div>
          <div className="nav-right">
            <span className="nav-user">👤 {user?.name}</span>
            <button className="nav-btn" onClick={onNewSession}>New Session</button>
            <button className="nav-btn" onClick={onLogout}>Logout</button>
          </div>
        </nav>

        {/* steps */}
        <div className="steps" style={{ maxWidth: 900, margin: "0 auto 1.5rem" }}>
          {[
            { label: "Login",    done: true },
            { label: "Upload",   done: true },
            { label: "Analyse",  done: true },
            { label: "Download", done: true },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 0, flex: 1 }}>
              <div className="step done">
                <div className="step-num">✓</div>
                <span>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="step-line" style={{ flex: 1 }} />}
            </div>
          ))}
        </div>

        <div className="page-wrap">

          {/* ── Card 1: Repeated Questions ── */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  <em>Repeated</em> Questions Found
                </div>
                <div className="card-sub">
                  Questions that appeared across multiple past papers — highest priority to study
                </div>
              </div>
            </div>

            {/* summary stats */}
            <div className="summary-strip">
              <div className="stat-cell">
                <div className="stat-num">{pdfCount}</div>
                <div className="stat-label">Papers Analysed</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">{repeatedQs.length}</div>
                <div className="stat-label">Repeated Questions</div>
              </div>
              <div className="stat-cell">
                <div className="stat-num">{totalQs}</div>
                <div className="stat-label">Predicted Questions</div>
              </div>
            </div>

            {/* repeated list */}
            <div className="repeated-body">
              {repeatedQs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--ink-light)", fontSize: "0.85rem" }}>
                  No repeated questions detected across the uploaded papers.
                </div>
              ) : (
                <div className="rep-list">
                  {visibleReps.map((q, i) => (
                    <div className="rep-row" key={i}>
                      <div className="rep-badge">{q.count}×</div>
                      <div style={{ flex: 1 }}>
                        <div className="rep-text">{q.question}</div>
                        {q.similar_variants?.length > 0 && (
                          <div className="rep-variants">
                            Also seen as: "{q.similar_variants[0]}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {repeatedQs.length > 5 && (
                    <button
                      className="show-more-btn"
                      onClick={() => setShowAll(p => !p)}
                    >
                      {showAll
                        ? "▲ Show less"
                        : `▼ Show ${repeatedQs.length - 5} more repeated questions`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Card 2: Predicted Paper ── */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">
                  Predicted <em>Question Paper</em>
                </div>
                <div className="card-sub">
                  AI-generated paper based on patterns found in your uploaded papers
                </div>
              </div>
            </div>

            <div className="paper-body">

              {/* paper header bar */}
              <div className="paper-meta">
                <div className="paper-subject">
                  {metadata.subject || "Predicted Exam Paper"}
                </div>
                <div className="paper-info">
                  {metadata.predicted_for || "Final Examination"}<br />
                  Total Marks: {metadata.total_marks || 100}
                </div>
              </div>

              {/* sections */}
              {sections.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--ink-light)", fontSize: "0.85rem" }}>
                  No paper content available.
                </div>
              ) : (
                sections.map((section, si) => (
                  <div className="section-block" key={si}>
                    <div className="section-title-bar">
                      <span className="section-name">{section.name}</span>
                      <span className="section-inst">{section.instructions}</span>
                    </div>
                    <div className="question-list">
                      {(section.questions || []).map((q, qi) => (
                        <div className="q-row" key={qi}>
                          <div className="q-num">{q.no}.</div>
                          <div className="q-text">{q.question}</div>
                          <div className="q-marks">{q.marks} M</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}

              {/* download strip */}
              <div className="download-strip">
                <div className="dl-info">
                  <strong>Ready to download</strong> — formatted A4 PDF with watermark
                </div>
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button className="new-btn" onClick={onNewSession}>
                    ← New Session
                  </button>
                  <button
                    className="dl-btn"
                    onClick={handleDownload}
                    disabled={downloading}
                  >
                    {downloading
                      ? <><span className="spinner" />&nbsp;Downloading…</>
                      : <>⬇ Download PDF</>
                    }
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* toast */}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}