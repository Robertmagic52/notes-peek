// app/page.js
'use client';

import { useState, useEffect } from 'react';

export default function PeekDashboard() {
  const [status, setStatus] = useState("continue");
  const [thought, setThought] = useState("");

  // Polls the server every second to instantly show your captured notes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/peek');
        const data = await res.json();
        setStatus(data.action);
        setThought(data.thought);
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

  const handleReset = async () => {
    await fetch('/api/peek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'continue' }),
    });
    setStatus("continue");
    setThought(""); // Visually clear the old note off the screen
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Dashboard</h1>
      
      {/* The Peek Display Container */}
      <div style={{ margin: '2rem 0', padding: '2rem', border: '2px solid #333', borderRadius: '12px', minHeight: '150px' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#666' }}>Incoming Data:</h2>
        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>
          {thought || "Waiting for input..."}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button 
          onClick={handleStop}
          style={{ flex: 1, padding: '1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
        >
          Stop Shortcut
        </button>
        
        <button 
          onClick={handleReset}
          style={{ flex: 1, padding: '1rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}
        >
          Reset for Next Set
        </button>
      </div>
      
      {/* Status Indicator */}
      <div style={{ marginTop: '2rem', textAlign: 'center', color: status === 'stop' ? '#ef4444' : '#22c55e' }}>
        <strong>Status: {status === 'stop' ? 'Stopped 🛑' : 'Listening 🟢'}</strong>
      </div>
    </div>
  );
}
