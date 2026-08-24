// app/api/peek/route.js

// In-memory state to hold your peeks and action commands
let serverState = {
  action: "continue",
  thought: "",
  history: []
};

export async function GET() {
  return Response.json(serverState);
}

export async function POST(request) {
  try {
    const body = await request.json();

    // If you hit the Reset button, completely clear the state for the next performance
    if (body.action === 'continue') {
      serverState = {
        action: "continue",
        thought: "",
        history: [] 
      };
    } else {
      // Standard update: capturing a new note or hitting Stop
      serverState = {
        ...serverState,
        ...body
      };
    }

    return Response.json({ success: true, state: serverState });
  } catch (error) {
    return Response.json({ success: false, error: "Invalid request" }, { status: 400 });
  }
}
