import { NextResponse } from 'next/server';

let screenshotState = {
  command: 'idle', // 'idle' or 'screenshot'
  screenshot: null,
};

// GET: Called by the iOS Shortcut to check if it should snap the screen
export async function GET() {
  return NextResponse.json({ 
    command: screenshotState.command, 
    screenshot: screenshotState.screenshot 
  });
}

// POST: Called by your Frontend (to trigger) or the Shortcut (to upload the base64 image)
export async function POST(req) {
  try {
    const body = await req.json();

    // If frontend clicked the button, set command to 'screenshot'
    if (body.command) {
      screenshotState.command = body.command;
      if (body.command === 'screenshot') {
        screenshotState.screenshot = null; // Clear old image on new request
      }
      return NextResponse.json({ success: true, command: screenshotState.command });
    }

    // If the Shortcut uploaded the base64 screenshot
    if (body.image) {
      screenshotState.screenshot = body.image;
      screenshotState.command = 'idle'; // Reset command back to idle
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
