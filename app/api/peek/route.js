import { NextResponse } from 'next/server';

let currentThought = 'Waiting for input...';
let historyLog = [];
let stopShortcut = false; // The kill switch flag

export async function GET() {
  return NextResponse.json({
    thought: currentThought,
    history: historyLog,
    action: stopShortcut ? 'stop' : 'continue', // Shortcut reads this
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 1. Dashboard sends the kill signal
    if (body.action === 'clear') {
      currentThought = 'Waiting for input...';
      stopShortcut = true; 
      return NextResponse.json({ success: true, action: 'stop' });
    }

    // 2. Shortcut sends a new thought
    const thought = body.thought || body.text;
    if (thought) {
      currentThought = thought;
      stopShortcut = false; // Reset the kill switch for the next performance
      
      if (thought !== 'Cleared!' && !historyLog.includes(thought)) {
        historyLog = [thought, ...historyLog].slice(0, 10);
      }
    }

    return NextResponse.json({ 
      success: true, 
      thought: currentThought, 
      history: historyLog, 
      action: stopShortcut ? 'stop' : 'continue' // Feeds the dictionary value back
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}