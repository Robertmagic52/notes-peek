'use client';
import { useState, useEffect } from 'react';

export default function NotePeekReceiver() {
  const [thought, setThought] = useState('Waiting for input...');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchThought = async () => {
      try {
        const res = await fetch('/api/peek');
        const data = await res.json();
        if (data.thought) setThought(data.thought);
        if (data.history) setHistory(data.history);
      } catch (err) {
        console.error('Failed to sync');
      }
    };

    fetchThought();
    const interval = setInterval(fetchThought, 1000);
    return () => clearInterval(interval);
  }, []);

  const clearSession = async () => {
    try {
      await fetch('/api/peek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thought: 'Cleared!' }),
      });
      setThought('Cleared!');
    } catch (err) {
      console.error('Failed to clear');
    }
  };

  return (
    <main style={{ backgroundColor: '#0a0118', color: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <h1 style={{ color: '#d8b4fe', letterSpacing: '2px', fontSize: '20px', marginBottom: '25px' }}>NOTE PEEK RECEIVER</h1>
      
      <button 
        onClick={clearSession}
        style={{ width: '130px', height: '130px', borderRadius: '50%', backgroundColor: '#7c3aed', color: '#fff', fontSize: '14px', fontWeight: 'bold', border: '4px solid #a855f7', cursor: 'pointer', marginBottom: '30px', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}
      >
        CLEAR PEEK
      </button>

      <div style={{ backgroundColor: '#130524', border: '1px solid #4c1d95', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '380px', textAlign: 'center', marginBottom: '25px' }}>
        <p style={{ color: '#9ca3af', fontSize: '10px', margin: '0 0 8px 0', letterSpacing: '1px' }}>INTERCEPTED THOUGHT:</p>
        <p style={{ color: '#c084fc', fontSize: '26px', fontWeight: 'bold', margin: 0, wordBreak: 'break-word' }}>{thought}</p>
      </div>

      <div style={{ width: '100%', maxWidth: '380px', backgroundColor: '#130524', border: '1px solid #3b0764', borderRadius: '12px', padding: '16px' }}>
        <p style={{ color: '#d8b4fe', fontSize: '12px', fontWeight: 'bold', margin: '0 0 12px 0', letterSpacing: '1px' }}>PEEK HISTORY</p>
        
        <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {history.length === 0 ? (
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '10px 0', textAlign: 'center' }}>No peeks recorded yet.</p>
          ) : (
            history.map((item, index) => (
              <div 
                key={index} 
                style={{ backgroundColor: '#1e0b36', padding: '10px 14px', borderRadius: '6px', border: '1px solid #4c1d95', fontSize: '15px', color: '#e9d5ff', wordBreak: 'break-word' }}
              >
                {item}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}