'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [thought, setThought] = useState<string>('Waiting for input...');
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/peek');
        const data = await res.json();
        if (data.thought) setThought(data.thought);
        if (data.history) setHistory(data.history);
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 200); 

    return () => clearInterval(interval);
  }, []);

  // 1. Stop Function: Sends "stop" to the API to kill the Shortcut
  const handleStop = async () => {
    await fetch('/api/peek', {
      method: 'POST',
      body: new URLSearchParams({ thought: 'stop' }),
    });
  };

  // 2. Clear Function: Sends "clear" to the API and wipes local history
  const handleClear = async () => {
    await fetch('/api/peek', {
      method: 'POST',
      body: new URLSearchParams({ thought: 'clear' }),
    });
    setThought('Waiting for input...');
    setHistory([]); 
  };

  return (
    <main style={{ background: '#0a0314', color: '#fff', minHeight: '100vh', padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>NOTE PEEK RECEIVER</h1>
      
      {/* Renamed to STOP PEEK - Changed to red for visibility */}
      <button onClick={handleStop} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '30px', fontSize: '16px', cursor: 'pointer', margin: '20px 0' }}>
        STOP PEEK
      </button>

      <div style={{ border: '1px solid #7c3aed', padding: '20px', borderRadius: '10px', maxWidth: '500px', margin: '20px auto', background: '#120624' }}>
        <h3>INTERCEPTED THOUGHT:</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{thought}</p>
      </div>

      <div style={{ border: '1px solid #7c3aed', padding: '20px', borderRadius: '10px', maxWidth: '500px', margin: '20px auto', background: '#120624' }}>
        <h3>PEEK HISTORY</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {history.map((item, index) => (
            <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #2a1b4e' }}>{item}</li>
          ))}
        </ul>
        
        {/* New CLEAR PEEK button added underneath history */}
        <button onClick={handleClear} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '30px', fontSize: '14px', cursor: 'pointer', marginTop: '20px' }}>
          CLEAR PEEK
        </button>
      </div>
    </main>
  );
}
