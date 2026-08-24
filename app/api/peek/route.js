export const dynamic = 'force-dynamic';
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
    let bodyData = {};
    let rawText = '';
    const contentType = request.headers.get('content-type') || '';

    // Handle JSON payloads (sent by your dashboard button)
    if (contentType.includes('application/json')) {
      try {
        bodyData = await request.json();
        if (bodyData.action === 'stop' || bodyData.thought === 'stop') {
          stopShortcut = true;
          return NextResponse.json({ success: true, action: 'stop' });
        }
        if (bodyData.action === 'clear' || bodyData.thought === 'clear') {
          currentThought = 'Waiting for input...';
          historyLog = [];
          stopShortcut = false;
          return NextResponse.json({ success: true, action: 'continue' });
        }
        if (bodyData.thought) {
          rawText = bodyData.thought;
        }
      } catch (e) {
        // Fallback if JSON parse fails
      }
    } 
    
    // Handle form data or raw text inputs (sent by iOS shortcuts)
    if (!rawText) {
      try {
        const formData = await request.formData();
        rawText = formData.get('thought') || formData.get('text') || formData.get('noteBody') || '';
      } catch (e) {
        rawText = await request.text();
      }
    }

    if (rawText === 'stop') {
      stopShortcut = true;
      return NextResponse.json({ success: true, action: 'stop' });
    }

    if (rawText === 'clear') {
      currentThought = 'Waiting for input...';
      historyLog = [];
      stopShortcut = false;
      return NextResponse.json({ success: true, action: 'continue' });
    }

    // Decode base64 RTF if sent from Apple Notes shortcuts
    let thought = rawText;
    if (typeof thought === 'string' && thought.length > 0) {
      if (thought.startsWith('e1xydGY') || (/^[A-Za-z0-9+/=]+$/.test(thought) && thought.length > 20)) {
        try {
          const decoded = Buffer.from(thought, 'base64').toString('utf8');
          const cleaned = decoded.replace(/\\[a-z0-9-]+\\?/g, ' ').replace(/[{}]/g, '').trim();
          if (cleaned.length > 0) thought = cleaned;
        } catch (err) {}
      }
      if (thought.includes('\\rtf')) {
        thought = thought.replace(/\\[a-z0-9-]+\\?/g, ' ').replace(/[{}]/g, '').trim();
      }
    }

    // Process normal incoming peek thoughts
    if (thought && typeof thought === 'string' && thought.trim() !== '') {
      currentThought = thought;
      stopShortcut = false;
      if (thought !== 'Waiting for input...' && !historyLog.includes(thought)) {
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
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
