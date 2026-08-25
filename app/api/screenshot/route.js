import { NextResponse } from 'next/server';

let sessionState = {
  command: 'idle', // 'idle' or 'screenshot'
  screenshot: null,
};

// GET: Returns current command state AND the screenshot image if available
export async function GET() {
  return NextResponse.json({ 
    command: sessionState.command, 
    screenshot: sessionState.screenshot 
  });
}

// POST: Sets the command from the frontend OR receives the image from the Shortcut
export async function POST(req) {
  try {
    const body = await req.json();

    // Frontend clicked the button to trigger a capture
    if (body.command) {
      sessionState.command = body.command;
      if (body.command === 'screenshot') {
        sessionState.screenshot = null; // Clear old screenshot on new trigger
      }
      return NextResponse.json({ success: true, command: sessionState.command });
    }

    // Shortcut uploaded the base64 screenshot
    if (body.image) {
      sessionState.screenshot = body.image;
      sessionState.command = 'idle'; // Reset back to idle
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
