'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function FakeNotesPage() {
  const router = useRouter();
  
  // Note State
  const [notes, setNotes] = useState<Array<{ id: string; content: string; updatedAt: string }>>([
    {
      id: '1',
      content: 'Welcome to Notes!\nType your multi-line prediction here, then double-tap the checkmark in the header to transmit it silently.',
      updatedAt: new Date().toISOString()
    }
  ]);
  
  const [activeNoteId, setActiveNoteId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);

  const editorRef = useRef<HTMLDivElement>(null);
  const lastTapTime = useRef(0);
  const touchStartY = useRef(0);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ios_notes_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setNotes(parsed);
          setActiveNoteId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load saved notes", e);
      }
    }
  }, []);

  // Sync active note content into editor when selection changes
  useEffect(() => {
    const note = notes.find(n => n.id === activeNoteId);
    if (editorRef.current && note) {
      if (editorRef.current.innerText !== note.content) {
        editorRef.current.innerText = note.content;
      }
    }
  }, [activeNoteId]);

  // Persist notes
  const saveNotes = (updatedNotes: Array<{ id: string; content: string; updatedAt: string }>) => {
    setNotes(updatedNotes);
    localStorage.setItem('ios_notes_data', JSON.stringify(updatedNotes));
  };

  // Secret Checkmark Double-Tap Handler (Transmits prediction)
  const handleCheckmarkClick = async () => {
    const now = Date.now();
    if (now - lastTapTime.current < 400) {
      lastTapTime.current = 0;
      await executePrediction();
    } else {
      lastTapTime.current = now;
    }
  };

  const executePrediction = async () => {
    const currentText = editorRef.current?.innerText || '';
    if (!currentText.trim()) return;

    // Split text by lines and clean them up for magic parsing
    const lines = currentText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
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
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (err) {
      console.error("Transmission failed", err);
    }
  };

  // Editor Input Handler (Auto-save + updates preview instantly)
  const handleEditorInput = () => {
    if (!activeNoteId) return;
    const newContent = editorRef.current?.innerText || '';
    
    const updated = notes.map(n => {
      if (n.id === activeNoteId) {
        return { ...n, content: newContent, updatedAt: new Date().toISOString() };
      }
      return n;
    });
    saveNotes(updated);
  };

  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      content: '',
      updatedAt: new Date().toISOString()
    };
    saveNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setIsMobileSidebarOpen(false);
    setTimeout(() => editorRef.current?.focus(), 50);
  };

  const deleteActiveNote = () => {
    if (notes.length <= 1) return;
    const filtered = notes.filter(n => n.id !== activeNoteId);
    saveNotes(filtered);
    setActiveNoteId(filtered[0].id);
  };

  const filteredNotes = notes.filter(n => 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeNote = notes.find(n => n.id === activeNoteId);

  // Two-finger swipe down gesture to go back home
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchStartY.current = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length >= 1 && touchStartY.current !== 0) {
      const endY = (e.changedTouches[0].clientY + (e.changedTouches[1]?.clientY || e.changedTouches[0].clientY)) / 2;
      if (endY - touchStartY.current > 75) {
        router.push('/');
      }
    }
    touchStartY.current = 0;
  };

  return (
    <div 
      className={`fixed inset-0 flex select-none overflow-hidden ${isDarkMode ? 'bg-[#000000] text-white' : 'bg-[#F2F2F7] text-gray-900'}`}
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* SIDEBAR */}
      <aside className={`w-full md:w-80 lg:w-96 flex flex-col h-full border-r ${isDarkMode ? 'bg-[#1C1C1E] border-[#38383A]' : 'bg-[#F6F6F6] border-[#C6C6C8]'} ${isMobileSidebarOpen ? 'flex' : 'hidden md:flex'}`}>
        
        {/* Sidebar Header */}
        <div className="px-4 pt-12 md:pt-4 pb-2">
          <div className="flex justify-between items-center mb-3">
            <div onClick={() => router.push('/')} className="flex items-center space-x-1 text-[#E5C02A] cursor-pointer font-semibold text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
              <span>Folders</span>
            </div>
            <div className="flex items-center space-x-3 text-[#E5C02A]">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-1.5 rounded-full hover:bg-black/10 transition">
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button onClick={createNewNote} className="p-1.5 rounded-full hover:bg-black/10 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight mb-3">Notes</h1>

          {/* Search Bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E5C02A] transition ${isDarkMode ? 'bg-[#2C2C2E] text-white' : 'bg-[#E3E3E8] text-black'}`}
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</div>
        <div className="flex-1 overflow-y-auto px-2 space-y-1 pb-4">
          {filteredNotes.map(note => {
            const lines = note.content.split('\n').filter(l => l.trim() !== '');
            const title = lines[0] || 'New Note';
            const snippet = lines.slice(1).join(' ') || 'No additional text';
            const isActive = note.id === activeNoteId;

            return (
              <div 
                key={note.id}
                onClick={() => {
                  setActiveNoteId(note.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`p-3 rounded-xl cursor-pointer transition mb-1 ${isActive ? 'bg-[#E5C02A] text-black shadow-sm' : isDarkMode ? 'hover:bg-[#2C2C2E] text-white' : 'hover:bg-gray-200 text-gray-900'}`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-sm truncate flex-1 pr-2">{title}</h3>
                  <span className={`text-[11px] shrink-0 ${isActive ? 'text-black/80' : 'text-gray-400'}`}>
                    {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className={`text-xs truncate ${isActive ? 'text-black/70' : 'text-gray-400'}`}>{snippet}</p>
              </div>
            );
          })}
        </div>
      </aside>

      {/* MAIN EDITOR PANE */}
      <main className={`flex-1 flex flex-col h-full relative ${isMobileSidebarOpen ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Editor Top Navigation Bar */}
        <div className="flex justify-between items-center px-4 pt-12 md:pt-3 pb-2">
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="md:hidden flex items-center text-[#E5C02A] font-medium cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"></path></svg>
              <span className="text-[17px]">Notes</span>
            </button>
          </div>

          {/* Top Right Action Capsule with Secret Checkmark */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center rounded-full px-3 py-1.5 space-x-3 border ${isDarkMode ? 'bg-[#1C1C1E] border-[#2C2C2E]/40' : 'bg-white border-gray-200 shadow-sm'}`}>
              <button onClick={deleteActiveNote} className="text-[#E5C02A] hover:opacity-80">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
              <button onClick={createNewNote} className="text-[#E5C02A] hover:opacity-80">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
            </div>

            {/* Secret Checkmark Trigger */}
            <button 
              onClick={handleCheckmarkClick}
              className="flex items-center justify-center w-7 h-7 rounded-full bg-[#E5C02A] text-black shadow-md active:scale-95 transition-transform"
              title="Double tap to transmit prediction"
            >
              {status === 'sent' ? (
                <span className="text-[9px] font-bold">✓✓</span>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              )}
            </button>
          </div>
        </div>

        {/* Timestamp Info */}
        <div className="text-center text-xs text-gray-400 py-1">
          {activeNote ? new Date(activeNote.updatedAt).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' }) : ''}
        </div>

        {/* Editable Content Area */}
        <div className="flex-1 px-6 md:px-12 py-3 overflow-y-auto">
          <div 
            ref={editorRef}
            contentEditable="true" 
            onInput={handleEditorInput}
            className="w-full h-full bg-transparent focus:outline-none text-[17px] leading-normal whitespace-pre-wrap"
            placeholder="Type your notes here..."
          />
        </div>

        {/* Bottom Toolbar */}
        <div className={`flex justify-between items-center px-6 py-3 border-t pb-8 ${isDarkMode ? 'bg-[#1C1C1E] border-[#2C2C2E]' : 'bg-white border-gray-200'}`}>
          <div className="flex space-x-7 text-[#E5C02A]">
            <button onClick={() => document.execCommand('bold', false)} title="Bold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"></path></svg>
            </button>
            <button onClick={() => document.execCommand('italic', false)} title="Italic">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 4h4m-2 0l-4 16m0 0h4"></path></svg>
            </button>
            <button onClick={() => document.execCommand('underline', false)} title="Underline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 3v7a6 6 0 0012 0V3M4 21h16"></path></svg>
            </button>
          </div>
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E5C02A]/10 text-[#E5C02A]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </div>
        </div>
      </main>
    </div>
  );
}
