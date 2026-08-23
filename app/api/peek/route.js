export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

let currentThought = 'Waiting for input...';
let historyLog = [];
let stopShortcut = false;

// 1. The security keys allowing the Apple Shortcut to transmit data
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 2. Handle the pre-flight security check the iPhone sends
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json({
    thought: currentThought,
    history: historyLog,
    action: stopShortcut ? 'stop' : 'continue',
  }, { headers: corsHeaders });
}

export async function POST(request) {
  try {
    const rawText = await request.text();
    let body;
    
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      body = { text: rawText };
    }
    
    if (body.action === 'clear') {
      currentThought = 'Waiting for input...';
      stopShortcut = true; 
      return NextResponse.json({ success: true, action: 'stop' }, { headers: corsHeaders });
    }

    // Try catching every possible way the Shortcut might format the text
    const thought = body.thought || body.text || body.value || (typeof body === 'string' ? body : null);
    
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
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: 'Failed' }, { status: 400, headers: corsHeaders });
  }
}