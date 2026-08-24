// app/api/peek/route.js

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

    // 1. Handle stop command
    if (body.action === 'stop') {
      serverState.action = 'stop';
    } 

    // 2. Handle resume/continue loop action
    if (body.action === 'continue') {
      serverState.action = 'continue';
    }

    // 3. Handle clearing just the active peek (keeps history intact!)
    if (body.action === 'clear_peek') {
      serverState.thought = "";
    }

    // 4. Handle incoming thoughts/peeks
    if (body.thought !== undefined && body.thought !== '') {
      serverState.thought = body.thought;
      // Adds the new peek to the front of the history list without duplicates or dropping old ones
      serverState.history.unshift(body.thought);
    }

    return Response.json({ success: true, state: serverState });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
