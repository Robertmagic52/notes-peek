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
    }, 200); // <-- Changed from 1000 to 200 for instant updates

    return () => clearInterval(interval);
  }, []);

  const handleClear = async () => {
    await fetch('/api/peek', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' }),
    });
    setThought('Waiting for input...');
  };

  return (
    <main style={{ background: '#0a0314', color: '#fff', minHeight: '100vh', padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>NOTE PEEK RECEIVER</h1>
      
      <button onClick={handleClear} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '15px 30px', borderRadius: '30px', fontSize: '16px', cursor: 'pointer', margin: '20px 0' }}>
        CLEAR PEEK
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
      </div>
    </main>
  );
}
