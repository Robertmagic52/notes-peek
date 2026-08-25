'use client';

import { useState, useEffect } from 'react';

export default function PeekDashboard() {
  const [activeTab, setActiveTab] = useState('peek'); // 'peek' or 'screenshot'

  // Peek Dashboard State
  const [status, setStatus] = useState("continue");
  const [thought, setThought] = useState("");
  const [history, setHistory] = useState([]);

  // Screenshot View State
  const [screenshotStatus, setScreenshotStatus] = useState('idle');
  const [screenshotData, setScreenshotData] = useState(null);

  // Polling for Peek
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

  // Polling for Screenshot View
  useEffect(() => {
    const interval = setInterval(async () => {
      if (activeTab !== 'screenshot') return;
      try {
        const res = await fetch('/api/screenshot');
        const data = await res.json();
        if (data.screenshot) {
          setScreenshotData(data.screenshot);
          setScreenshotStatus('received');
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTab]);

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

  const handleTriggerScreenshot = async () => {
    setScreenshotStatus('waiting');
    setScreenshotData(null);
    try {
      await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'screenshot' }),
      });
    } catch (err) {
      console.error('Failed to send trigger', err);
      setScreenshotStatus('idle');
    }
  };

  // BACKEND RESET FUNCTION: Clears local state AND tells the backend to wipe its image/command state
  const handleResetScreenshot = async () => {
    setScreenshotData(null);
    setScreenshotStatus('idle');
    try {
      await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'idle' }),
      });
    } catch (err) {
      console.error('Failed to reset backend', err);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Navigation Tabs Header */}
      <div style={{ display: 'flex', backgroundColor: '#e5e7eb', borderRadius: '10px', padding: '4px', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('peek')}
          style={{ flex: 1, padding: '0.75rem', backgroundColor: activeTab === 'peek' ? '#ffffff' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: activeTab === 'peek' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: '#111' }}
        >
          Peek Dashboard 👁️
        </button>
        <button
          onClick={() => setActiveTab('screenshot')}
          style={{ flex: 1, padding: '0.75rem', backgroundColor: activeTab === 'screenshot' ? '#ffffff' : 'transparent', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: activeTab === 'screenshot' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: '#111' }}
        >
          Screenshot View 📸
        </button>
      </div>

      {/* TAB 1: ORIGINAL PEEK DASHBOARD */}
      {activeTab === 'peek' && (
        <>
          <h1>Dashboard</h1>
          
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

          <div style={{ flexGrow: 1 }}></div>

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

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a 
              href="https://www.icloud.com/shortcuts/da003ebafb424909a339a60832ebf312" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-block', width: '100%', padding: '1rem', backgroundColor: '#0070f3', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.05rem', boxSizing: 'border-box' }}
            >
              Download iOS Shortcut 📥
            </a>
          </div>
        </>
      )}

      {/* TAB 2: SCREENSHOT VIEW */}
      {activeTab === 'screenshot' && (
        <>
          <h1>Screenshot View</h1>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button 
              onClick={handleTriggerScreenshot}
              style={{ flex: 2, padding: '1rem', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              {screenshotStatus === 'waiting' ? 'Waiting for Device...' : 'Take Screenshot'}
            </button>
            <button 
              onClick={handleResetScreenshot}
              style={{ flex: 1, padding: '1rem', backgroundColor: '#e5e7eb', color: '#111', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
            >
              Reset 🔄
            </button>
          </div>

          <div style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
            Status: <strong style={{ textTransform: 'uppercase' }}>{screenshotStatus}</strong>
          </div>

          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {screenshotData ? (
              <div style={{ width: '100%', border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
                <div style={{ padding: '0.5rem 1rem', backgroundColor: '#eee', fontSize: '0.9rem', fontWeight: 'bold' }}>Captured Image</div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <img 
                    src={`data:image/png;base64,${screenshotData}`} 
                    alt="Target Screenshot" 
                    style={{ maxWidth: '100%', maxHeight: '50vh', objectFit: 'contain' }}
                  />
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', height: '250px', border: '2px dashed #ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                Screenshot will appear here
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
}
