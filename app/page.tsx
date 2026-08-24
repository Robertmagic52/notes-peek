'use client';

import { useState, useEffect } from 'react';

export default function PeekDashboard() {
  const [status, setStatus] = useState("continue");
  const [thought, setThought] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/peek');
        const data = await res.json();
        setStatus(data.action);
        setThought(data.thought || "");
        setHistory(data.history || []);
      } catch (error) {
        console.error("Error fetching peek:", error);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleStop = async () => {
    await fetch('/api/peek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop' }),
    });
    setStatus("stop");
  };

  const handleResume = async () => {
    await fetch('/api/peek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'continue' }),
    });
    setStatus("continue");
  };

  const handleClearPeek = async () => {
    await fetch('/api/peek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_peek' }),
    });
    setThought("");
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <h1>Dashboard</h1>
      
      {/* Primary Controls */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        {status === 'stop' ? (
          <button 
            onClick={handleResume}
            style={{ flex: 1, padding: '1rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            Resume Listening 🟢
          </button>
        ) : (
          <button 
            onClick={handleStop}
            style={{ flex: 1, padding: '1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
          >
            Stop Shortcut 🛑
          </button>
        )}
      </div>

      <div style={{ textAlign: 'center', color: status === 'stop' ? '#ef4444' : '#22c55e', marginBottom: '2rem' }}>
        <strong>Status: {status === 'stop' ? 'Stopped' : 'Listening'}</strong>
      </div>

      {/* Active Peek Display */}
      <div style={{ padding: '2rem', border: '2px solid #333', borderRadius: '12px', minHeight: '140px', backgroundColor: '#f9fafb', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', color: '#666' }}>Active Peek:</h2>
          {thought && (
            <button 
              onClick={handleClearPeek}
              style={{ padding: '0.4rem 0.8rem', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              Clear Peek
            </button>
          )}
        </div>
        <p style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: 0, wordBreak: 'break-word', color: '#111', textAlign: 'center' }}>
          {thought || "Waiting for input..."}
        </p>
      </div>

      {/* Spacer to push history to the bottom */}
      <div style={{ flexGrow: 1 }}></div>

      {/* History Feed Section */}
      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#374151' }}>Previous Peeks History ({history.length})</h3>
        {history.length === 0 ? (
          <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>No history recorded yet.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, maxHeight: '250px', overflowY: 'auto' }}>
            {history.map((item, index) => (
              <li key={index} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', backgroundColor: '#fff' }}>
                <span style={{ fontWeight: '500', color: '#1f2937' }}>{item}</span>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>#{history.length - index}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
