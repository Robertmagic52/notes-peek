export const dynamic = 'force-dynamic'; // This line is CRITICAL. It disables Vercel's caching.
import { NextResponse } from 'next/server';

let currentThought = 'Waiting for input...';
let historyLog = [];
let stopShortcut = false;

export async function GET() {
  return NextResponse.json({
    thought: currentThought,
    history: historyLog,
    action: stopShortcut ? 'stop' : 'continue',
  });
}

export async function POST(request) {
  try {
    // 1. Read the raw incoming data safely
    const rawText = await request.text();
    let body;
    
    try {
      body = JSON.parse(rawText); // Try parsing it as clean JSON
    } catch (e) {
      body = { text: rawText }; // If the Shortcut sends messy text, catch it here
    }
    
    // 2. Check for the Dashboard Kill Signal
    if (body.action === 'clear') {
      currentThought = 'Waiting for input...';
      stopShortcut = true; 
      return NextResponse.json({ success: true, action: 'stop' });
    }

    // 3. Extract the thought, hunting for common Shortcut dictionary keys
    const thought = body.thought || body.text || body.value || (typeof body === 'string' ? body : null);
    
    // 4. Update the server memory
    if (thought && thought.trim() !== '') {
      currentThought = thought;
      stopShortcut = false; 
      
      if (thought !== 'Cleared!' && !historyLog.includes(thought)) {
        historyLog = [thought, ...historyLog].slice(0, 10);
      }
    }

    return NextResponse.json({ 
      success: true, 
      thought: currentThought, 
      history: historyLog, 
      action: stopShortcut ? 'stop' : 'continue' 
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 400 });
  }
}