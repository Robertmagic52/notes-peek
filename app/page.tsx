'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ScreenshotTabPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'waiting' | 'received'>('idle');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);

  // 1. Button Click: Posts the word "screenshot" to your backend
  const handleTriggerScreenshot = async () => {
    setStatus('waiting');
    setScreenshotData(null);

    try {
      await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'screenshot' }),
      });
    } catch (err) {
      console.error('Failed to send trigger', err);
      setStatus('idle');
    }
  };

  // 2. Polling Loop: Checks the backend every 1.5 seconds for the incoming image
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/screenshot');
        const data = await res.json();

        if (data.screenshot) {
          setScreenshotData(data.screenshot);
          setStatus('received');
        }
      } catch (err) {
        console.error('Polling error', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="min-h-screen bg-[#000000] text-white flex flex-col p-6 select-none"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      {/* Top Header / Navigation Tab Bar */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#2C2C2E]">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/')}
            className="text-[#E5C02A] text-sm font-medium"
          >
            ← Back to Notes
          </button>
          <h1 className="text-xl font-bold">Remote Divination Tab</h1>
        </div>
        <div className="flex bg-[#1C1C1E] p-1 rounded-lg text-xs font-semibold">
          <button className="px-3 py-1.5 rounded-md bg-[#2C2C2E] text-white">Screenshot View</button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-col items-center flex-1 max-w-md mx-auto w-full space-y-6">
        
        {/* The Trigger Button */}
        <button 
          onClick={handleTriggerScreenshot}
          className="w-full py-4 bg-[#E5C02A] text-black font-bold text-lg rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          {status === 'waiting' ? 'Waiting for Device...' : 'Take Screenshot'}
        </button>

        {/* Status Indicator */}
        <div className="text-xs text-gray-400 tracking-wide uppercase">
          Status: <span className="text-white font-mono">{status}</span>
        </div>

        {/* Screenshot Display Area (Right underneath the button) */}
        <div className="w-full flex-1 flex items-center justify-center">
          {screenshotData ? (
            <div className="w-full border border-[#38383A] bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-2xl animate-fade-in">
              <div className="bg-[#2C2C2E] px-4 py-2 text-xs font-medium text-[#E5C02A] flex justify-between items-center">
                <span>Captured Target Screen</span>
                <span className="text-gray-400">Live</span>
              </div>
              <div className="p-2">
                <img 
                  src={`data:image/png;base64,${screenshotData}`} 
                  alt="Target Device Screenshot" 
                  className="w-full rounded-lg object-contain max-h-[60vh]"
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-64 border-2 border-dashed border-[#2C2C2E] rounded-2xl flex flex-col items-center justify-center text-gray-500 text-sm">
              <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"></path>
              </svg>
              <span>Screenshot will appear here</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
