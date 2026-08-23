import { NextResponse } from 'next/server';

let currentThought = 'Waiting for input...';
let historyLog = [];

export async function GET() {
  return NextResponse.json({
    thought: currentThought,
    history: historyLog,
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    // Supports whatever key your shortcut sends (e.g., "thought", "text", or raw body)
    const thought = body.thought || body.text || 'Received empty peek';

    if (thought) {
      currentThought = thought;
      if (thought !== 'Cleared!' && !historyLog.includes(thought)) {
        historyLog = [thought, ...historyLog].slice(0, 10);
      }
    }

    return NextResponse.json({
      success: true,
      thought: currentThought,
      history: historyLog,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
