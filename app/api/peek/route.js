export const dynamic = 'force-dynamic';

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

    if (body.action === 'stop') {
      serverState.action = 'stop';
    } 

    if (body.action === 'continue') {
      serverState.action = 'continue';
      if (!body.thought && body.reset) {
         serverState.thought = '';
         serverState.history = [];
      }
    }

    if (body.action === 'clear_peek') {
      serverState.thought = "";
    }

    if (body.thought !== undefined && body.thought !== '') {
      serverState.thought = body.thought;
      serverState.history.unshift(body.thought);
      
      // Keep memory clean for long gigs
      if (serverState.history.length > 50) {
        serverState.history.pop();
      }
    }

    return Response.json({ success: true, state: serverState });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 400 });
  }
}
