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
        thought = formData.get('thought') || formData.get('text') || formData.get('noteBody') || '';
      } catch (e) {
        thought = await request.text();
      }
    }

    // Convert thought to string safely
    if (typeof thought !== 'string') {
      thought = String(thought || '');
    }

    // Strip "thought=" prefix if it accidentally got prepended
    if (thought.startsWith('thought=')) {
      thought = thought.substring(8);
    }

    // Clean up RTF / Base64 wrappers
    if (thought.startsWith('e1xydGY') || thought.includes('\\rtf') || /^[A-Za-z0-9+/=]+$/.test(thought) && thought.length > 20) {
      try {
        const base64Clean = thought.replace(/^thought=/, '');
        const decoded = Buffer.from(base64Clean, 'base64').toString('utf8');
        const cleaned = decoded.replace(/\\[a-z0-9-]+\\?/g, ' ').replace(/[{}]/g, '').trim();
        if (cleaned.length > 0) {
          thought = cleaned;
        }
      } catch (err) {
        // Fallback if base64 decoding throws an error
      }
    }

    // Final regex pass to eliminate any lingering RTF tags
    if (thought.includes('\\rtf') || thought.includes('\\ansicpg')) {
      thought = thought.replace(/\\[a-z0-9-]+\\?/g, ' ').replace(/[{}]/g, '').trim();
    }

    if (thought === 'clear') {
      currentThought = 'Waiting for input...';
      stopShortcut = true; 
      return NextResponse.json({ success: true, action: 'stop' });
    }

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
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
