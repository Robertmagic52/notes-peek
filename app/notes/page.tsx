'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function FakeNotesPage() {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');
  
  const router = useRouter();
  const lastTapTime = useRef(0);
  const touchStartY = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Secret trigger mapped to the '...' button
  const handleSecretTap = async () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime.current;

    if (timeSinceLastTap < 400) {
      lastTapTime.current = 0;
      await executePrediction();
    } else {
      lastTapTime.current = now;
    }
  };

  const executePrediction = async () => {
    if (!text.trim()) return;

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let finalPrediction = '';

    if (lines.length >= 3) {
      const destination = lines[0] || "Hawaii";
      const month = lines[1] || "February";
      const forgottenItem = lines[2] || "towels";

      finalPrediction = `You will think of a trip to ${destination}\nin the month of ${month}.\n\n\n\np.s. you will forget ${forgottenItem}...`;
    } else {
      const thought = lines[0] || "something special";
      finalPrediction = `You will think of ${thought}.`;
    }

    try {
      const res = await fetch('/api/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: finalPrediction }),
      });

      if (res.ok) {
        setStatus('sent');
        textareaRef.current?.blur();
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (err) {
      console.error("Transmission failed", err);
    }
  };

  // Two-finger swipe down gesture to escape back to home
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchStartY.current = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length >= 1 && touchStartY.current !== 0) {
      const endY = (e.changedTouches[0].clientY + (e.changedTouches[1]?.clientY || e.changedTouches[0].clientY)) / 2;
      const distance = endY - touchStartY.current;

      if (distance > 75) {
        router.push('/');
      }
    }
    touchStartY.current = 0;
  };

  return (
    <div 
      className="fixed inset-0 bg-[#000000] text-white flex flex-col select-none overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Authentic iOS Top Header */}
      <div className="flex justify-between items-center px-4 pt-6 pb-2 bg-[#000000]">
        
        {/* Bare Chevron Back Button */}
        <div 
          onClick={() => router.push('/')} 
          className="flex items-center text-[#E5C02A] cursor-pointer"
        >
          <svg className="w-8 h-8 ml-[-6px]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path>
          </svg>
        </div>

        {/* Top Right Actions (Changes based on focus) */}
        {isFocused ? (
          <button 
            onClick={() => textareaRef.current?.blur()}
            className="text-[#E5C02A] font-semibold text-[17px] mr-1 active:opacity-70 transition-opacity"
          >
            Done
          </button>
        ) : (
          <div className="flex items-center space-x-2.5">
            {/* Undo Button */}
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1C1C1E] text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
              </svg>
            </div>
            
            {/* Share Button */}
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1C1C1E] text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
            </div>

            {/* More (...) Button -> THIS IS THE SECRET TRIGGER */}
            <button 
              onClick={handleSecretTap}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1C1C1E] text-gray-300 active:scale-95 transition-transform"
            >
              {status === 'sent' ? (
                <span className="text-[11px] font-bold text-[#E5C02A]">✓✓</span>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main Textarea Area */}
      <div className="flex-1 px-5 pt-2 pb-32 overflow-y-auto">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder=""
          className="w-full h-full bg-transparent resize-none focus:outline-none text-[17px] text-white leading-normal"
        />
      </div>

      {/* Floating Bottom Toolbar Overlay (Hides when typing) */}
      {!isFocused && (
        <div className="absolute bottom-8 left-0 right-0 px-4 flex justify-between items-end pointer-events-none">
          
          {/* Left Floating Pill */}
          <div className="flex items-center space-x-6 bg-[#2C2C2E]/95 backdrop-blur-xl rounded-full px-5 py-3.5 pointer-events-auto shadow-lg">
            {/* Checklist Icon */}
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            
            {/* Paperclip Icon */}
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
            </svg>
            
            {/* Markup Icon */}
            <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          </div>

          {/* Right Floating Circle (Compose) */}
          <div className="flex items-center justify-center w-[52px] h-[52px] rounded-full bg-[#2C2C2E]/95 backdrop-blur-xl pointer-events-auto shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </div>

        </div>
      )}
    </div>
  );
}
