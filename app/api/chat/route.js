import { NextResponse } from "next/server";

export const maxDuration = 60;

const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function POST(req) {
  try {
    const body = await req.json();
    const { messages, model = "meta/llama-3.1-8b-instruct" } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    if (!model || typeof model !== "string") {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

    if (!NVIDIA_API_KEY) {
      return NextResponse.json(
        { error: "NVIDIA API key not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(NVIDIA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.6,
        top_p: 0.7,
        max_tokens: 4096,
        stream: true,
      }),
      signal: req.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error?.message ||
        errorData.message ||
        errorData.detail ||
        `NVIDIA API error (${response.status})`;
      console.error("NVIDIA API Error:", response.status, errorData);
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;
        let reader = null;

        const safeEnqueue = (data) => {
          if (!isClosed) {
            try {
              controller.enqueue(data);
            } catch (e) {
              if (e.message?.includes("Controller is already closed")) {
                isClosed = true;
              } else {
                throw e;
              }
            }
          }
        };

        const safeClose = () => {
          if (!isClosed) {
            try {
              controller.close();
              isClosed = true;
            } catch {
              isClosed = true;
            }
          }
        };

        req.signal?.addEventListener("abort", () => {
          isClosed = true;
          if (reader) reader.cancel().catch(() => {});
          safeClose();
        });

        try {
          reader = response.body.getReader();

          while (true) {
            if (isClosed) break;

            const { done, value } = await reader.read();

            if (done) {
              safeEnqueue(encoder.encode("data: [DONE]\n\n"));
              safeClose();
              break;
            }

            if (isClosed) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk
              .split("\n")
              .filter((line) => line.trim() !== "");

            for (const line of lines) {
              if (isClosed) break;

              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                if (data === "[DONE]") continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || "";

                  if (content) {
                    safeEnqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ content })}\n\n`,
                      ),
                    );
                  }
                } catch {
                  // Skip malformed chunks
                }
              }
            }
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Stream error:", error);
            if (!isClosed) {
              safeEnqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ error: error.message })}\n\n`,
                ),
              );
            }
          }
        } finally {
          safeClose();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
