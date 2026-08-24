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
    let thought = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('form') || contentType.includes('urlencoded') || request.method === 'POST') {
      try {
        const formData = await request.formData();
        thought = formData.get('thought') || formData.get('text') || formData.get('noteBody');
      } catch (e) {
        thought = await request.text();
      }
    }

    // Decode and clean up RTF / Base64 strings automatically
    if (typeof thought === 'string') {
      // If it looks like base64-encoded RTF data starting with e1xydGY
      if (thought.startsWith('e1xydGY') || /^[A-Za-z0-9+/=]+$/.test(thought) && thought.length > 20) {
        try {
          const decoded = Buffer.from(thought, 'base64').toString('utf8');
          // Strip RTF control words and brackets to leave pure text
          const cleaned = decoded.replace(/\\[a-z0-9-]+\\?/g, ' ').replace(/[{}]/g, '').trim();
          if (cleaned.length > 0) {
            thought = cleaned;
          }
        } catch (err) {
          // Keep raw if decoding fails
        }
      }
      
      // Secondary cleanup if raw RTF tags came through directly
      if (thought.includes('\\rtf')) {
        thought = thought.replace(/\\[a-z0-9-]+\\?/g, ' ').replace(/[{}]/g, '').trim();
      }
    }

    // COMMAND 1: Stop the iOS shortcut loop
    if (thought === 'stop') {
      stopShortcut = true; 
      return NextResponse.json({ success: true, action: 'stop' });
    }

    // COMMAND 2: Wipe the current thought AND history board
    if (thought === 'clear') {
      currentThought = 'Waiting for input...';
      historyLog = [];
      stopShortcut = false; // Resets the flag so you can start a new loop later
      return NextResponse.json({ success: true, action: 'continue' });
    }

    // Process actual inputs
    if (thought && typeof thought === 'string' && thought.trim() !== '') {
      currentThought = thought;
      stopShortcut = false; 
      
      if (thought !== 'Waiting for input...' && thought !== 'Cleared!' && !historyLog.includes(thought)) {
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
