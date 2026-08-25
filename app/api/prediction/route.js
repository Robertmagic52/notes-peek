import { NextResponse } from 'next/server';

// Temporary server memory store
let activePrediction = "";

export async function GET() {
  if (!activePrediction) {
    // Return empty string so the Shortcut loop keeps waiting quietly
    return new NextResponse("", { status: 200 });
  }

  const payload = activePrediction;
  activePrediction = ""; // Clear memory after serving so it only pastes ONCE
  
  return new NextResponse(payload, { 
    status: 200,
    headers: { 'Content-Type': 'text/plain' } // Forces plain text for Apple Notes
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    activePrediction = body.text || "";
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
