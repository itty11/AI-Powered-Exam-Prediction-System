import { useState, useEffect } from "react";
import Landing  from "./pages/Landing";
import Login    from "./pages/Login";
import Upload   from "./pages/Upload";
import Analysis from "./pages/Analysis";
import Result   from "./pages/Result";

export default function App() {
  const [page,      setPage]      = useState("landing"); 
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [checking,  setChecking]  = useState(true);

  // verify saved token on load
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (!savedToken) { setChecking(false); return; }

    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setToken(savedToken); setUser(data.user); setPage("upload"); })
      .catch(() => localStorage.clear())
      .finally(() => setChecking(false));
  }, []);

  const handleLogin      = (u, t) => { setUser(u); setToken(t); setPage("upload"); };
  const handleLogout     = ()     => { localStorage.clear(); setUser(null); setToken(""); setSessionId(null); setPage("landing"); };
  const handleUploaded   = (sid)  => { setSessionId(sid); setPage("analysis"); };
  const handleDone       = ()     => setPage("result");
  const handleNewSession = ()     => { setSessionId(null); setPage("upload"); };

  if (checking) return null;

  if (page === "landing")  return <Landing  onLogin={() => setPage("login")} onSignup={() => setPage("login")} />;
  if (page === "login")    return <Login    onLogin={handleLogin} />;
  if (page === "upload")   return <Upload   token={token} user={user} onLogout={handleLogout} onDone={handleUploaded} />;
  if (page === "analysis") return <Analysis token={token} user={user} sessionId={sessionId} onDone={handleDone} />;
  return                          <Result   token={token} user={user} sessionId={sessionId} onLogout={handleLogout} onNewSession={handleNewSession} />;
}