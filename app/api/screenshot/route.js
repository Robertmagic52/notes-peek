import { NextResponse } from 'next/server';

let screenshotState = {
  command: 'idle', // 'idle' or 'screenshot'
  screenshot: null,
};

// GET: Called by the iOS Shortcut to check the current command state
export async function GET() {
  return NextResponse.json({ 
    command: screenshotState.command, 
    screenshot: screenshotState.screenshot 
  });
}

// POST: Handles frontend triggers, Shortcut uploads, and the backend reset
export async function POST(req) {
  try {
    const body = await req.json();

    // If command is sent ('screenshot' or 'idle')
    if (body.command) {
      screenshotState.command = body.command;
      
      // If resetting to idle, wipe the stored screenshot image too
      if (body.command === 'idle') {
        screenshotState.screenshot = null;
      }
      
      // If triggering a new screenshot, clear out the old image first
      if (body.command === 'screenshot') {
        screenshotState.screenshot = null;
      }

      return NextResponse.json({ success: true, command: screenshotState.command });
    }

    // If the Shortcut uploaded the base64 screenshot
    if (body.image) {
      screenshotState.screenshot = body.image;
      screenshotState.command = 'idle'; // Reset command back to idle after successful capture
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
