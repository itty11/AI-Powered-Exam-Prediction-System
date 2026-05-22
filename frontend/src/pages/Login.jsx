import { useState } from "react";

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

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-root {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.10) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(26,26,46,0.06) 0%, transparent 50%),
      var(--cream);
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }

  /* subtle ruled-paper lines */
  .login-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: repeating-linear-gradient(
      transparent,
      transparent 27px,
      rgba(201,168,76,0.10) 28px
    );
    pointer-events: none;
  }

  .card {
    background: var(--paper);
    border: 1px solid var(--border);
    border-radius: 3px;
    box-shadow: var(--shadow), 0 1px 0 var(--gold-light);
    width: 100%;
    max-width: 440px;
    position: relative;
    animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* top gold rule */
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--gold), var(--gold-light), var(--gold));
    border-radius: 3px 3px 0 0;
  }

  .card-header {
    padding: 2.5rem 2.5rem 1.5rem;
    text-align: center;
    border-bottom: 1px solid var(--border);
  }

  .brand-icon {
    width: 52px;
    height: 52px;
    margin: 0 auto 1rem;
    background: var(--ink);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .brand-title {
    font-family: 'DM Serif Display', serif;
    font-size: 1.6rem;
    color: var(--ink);
    letter-spacing: -0.02em;
    line-height: 1.2;
  }

  .brand-title em {
    font-style: italic;
    color: var(--gold);
  }

  .brand-sub {
    font-size: 0.82rem;
    color: var(--ink-light);
    margin-top: 0.35rem;
    font-weight: 300;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* tab switcher */
  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 1px solid var(--border);
  }

  .tab-btn {
    padding: 0.85rem;
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--ink-light);
    cursor: pointer;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: color 0.2s, background 0.2s;
    position: relative;
  }

  .tab-btn.active {
    color: var(--ink);
    background: var(--paper);
  }

  .tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 20%; right: 20%;
    height: 2px;
    background: var(--gold);
  }

  .tab-btn:first-child {
    border-right: 1px solid var(--border);
  }

  /* form area */
  .form-body {
    padding: 2rem 2.5rem 2.5rem;
  }

  .field {
    margin-bottom: 1.2rem;
    animation: fieldIn 0.35s ease both;
  }

  @keyframes fieldIn {
    from { opacity: 0; transform: translateX(-8px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .field:nth-child(1) { animation-delay: 0.05s; }
  .field:nth-child(2) { animation-delay: 0.10s; }
  .field:nth-child(3) { animation-delay: 0.15s; }

  .field label {
    display: block;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-light);
    margin-bottom: 0.4rem;
  }

  .field input {
    width: 100%;
    padding: 0.7rem 0.9rem;
    border: 1px solid var(--border);
    border-radius: 2px;
    background: var(--cream);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem;
    color: var(--ink);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  }

  .field input:focus {
    border-color: var(--gold);
    background: var(--paper);
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12);
  }

  .field input::placeholder { color: #bbb; }

  /* error / success banners */
  .banner {
    padding: 0.65rem 0.9rem;
    border-radius: 2px;
    font-size: 0.85rem;
    margin-bottom: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: fieldIn 0.25s ease both;
  }

  .banner.error {
    background: #fdf0ef;
    border: 1px solid #e8c0bc;
    color: var(--red);
  }

  .banner.success {
    background: #edfbf3;
    border: 1px solid #b7e5c8;
    color: var(--green);
  }

  /* submit button */
  .submit-btn {
    width: 100%;
    padding: 0.85rem;
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
    margin-top: 0.5rem;
    position: relative;
    overflow: hidden;
  }

  .submit-btn:hover:not(:disabled) {
    background: #2c2c4e;
    box-shadow: 0 4px 16px rgba(26,26,46,0.25);
    transform: translateY(-1px);
  }

  .submit-btn:active:not(:disabled) { transform: translateY(0); }

  .submit-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* spinner */
  .spinner {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid rgba(232,213,163,0.3);
    border-top-color: var(--gold-light);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .card-footer {
    padding: 1rem 2.5rem 1.5rem;
    text-align: center;
    border-top: 1px solid var(--border);
    font-size: 0.78rem;
    color: var(--ink-light);
    letter-spacing: 0.02em;
  }

  .card-footer strong {
    color: var(--gold);
    font-weight: 600;
  }

  /* password strength */
  .strength-bar {
    height: 3px;
    border-radius: 2px;
    margin-top: 0.4rem;
    background: var(--border);
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s, background 0.3s;
  }

  .strength-label {
    font-size: 0.72rem;
    margin-top: 0.2rem;
    font-weight: 500;
  }
`;

// ── Password strength helper ──────────────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { pct: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { pct: 20,  label: "Too short",  color: "#e74c3c" },
    { pct: 40,  label: "Weak",       color: "#e67e22" },
    { pct: 60,  label: "Fair",       color: "#f1c40f" },
    { pct: 80,  label: "Good",       color: "#2ecc71" },
    { pct: 100, label: "Strong",     color: "#27ae60" },
  ];
  return map[Math.min(score, 4)];
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Login({ onLogin }) {
  const [tab,     setTab]     = useState("login");   // "login" | "signup"
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  // login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass,  setLoginPass]  = useState("");

  // signup fields
  const [signName,  setSignName]  = useState("");
  const [signEmail, setSignEmail] = useState("");
  const [signPass,  setSignPass]  = useState("");

  const strength = getStrength(signPass);

  function switchTab(t) {
    setTab(t);
    setError("");
    setSuccess("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!loginEmail || !loginPass) {
      setError("Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      onLogin && onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!signName || !signEmail || !signPass) {
      setError("All fields are required.");
      return;
    }
    if (signPass.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signName, email: signEmail, password: signPass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      setSuccess(`Welcome, ${data.user.name}! Redirecting…`);
      setTimeout(() => onLogin && onLogin(data.user, data.token), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="login-root">
        <div className="card">

          {/* header */}
          <div className="card-header">
            <div className="brand-icon">📄</div>
            <div className="brand-title">Exam<em>PredictorAI</em></div>
            <div className="brand-sub">AI Question Paper Predictor</div>
          </div>

          {/* tabs */}
          <div className="tabs">
            <button
              className={`tab-btn ${tab === "login"  ? "active" : ""}`}
              onClick={() => switchTab("login")}
            >Sign In</button>
            <button
              className={`tab-btn ${tab === "signup" ? "active" : ""}`}
              onClick={() => switchTab("signup")}
            >Register</button>
          </div>

          {/* form body */}
          <div className="form-body">

            {error   && <div className="banner error">  ✕ {error}  </div>}
            {success && <div className="banner success"> ✓ {success}</div>}

            {tab === "login" ? (
              <form onSubmit={handleLogin} key="login">
                <div className="field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <button className="submit-btn" type="submit" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Signing in…" : "Sign In"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignup} key="signup">
                <div className="field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={signName}
                    onChange={e => setSignName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
                <div className="field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={signEmail}
                    onChange={e => setSignEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={signPass}
                    onChange={e => setSignPass(e.target.value)}
                    autoComplete="new-password"
                  />
                  {signPass && (
                    <>
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{ width: `${strength.pct}%`, background: strength.color }}
                        />
                      </div>
                      <div className="strength-label" style={{ color: strength.color }}>
                        {strength.label}
                      </div>
                    </>
                  )}
                </div>
                <button className="submit-btn" type="submit" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Creating account…" : "Create Account"}
                </button>
              </form>
            )}
          </div>

          {/* footer */}
          <div className="card-footer">
            Upload 3–5 past papers →&nbsp;
            <strong>AI finds patterns</strong>&nbsp;
            → Download predicted paper
          </div>

        </div>
      </div>
    </>
  );
}