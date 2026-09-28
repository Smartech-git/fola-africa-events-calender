import { createEventSubmission } from "@/payload/submissions/submit-event";

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { success: false, error: "Send a JSON request body." },
      { status: 415 },
    );
  }
  // Limit the streamed body too: Content-Length alone is not reliable.
  const reader = request.body?.getReader();
  if (!reader)
    return Response.json(
      { success: false, error: "A request body is required." },
      { status: 400 },
    );
  let body = "";
  let size = 0;
  const decoder = new TextDecoder();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 32_768) {
        await reader.cancel();
        return Response.json(
          { success: false, error: "Submission is too large." },
          { status: 413 },
        );
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    const { status, ...result } = await createEventSubmission(JSON.parse(body));
    return Response.json(result, { status });
  } catch {
    return Response.json(
      { success: false, error: "Send a valid JSON request body." },
      { status: 400 },
    );
  }
}
