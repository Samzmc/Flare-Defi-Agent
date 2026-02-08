import { NextRequest, NextResponse } from "next/server";
import { getMockResponse } from "@/lib/mockData";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];

    const useMock = process.env.USE_MOCK !== "false";

    if (useMock) {
      const response = await getMockResponse(lastMessage.content);
      return NextResponse.json(response);
    }

    // Real backend mode
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

    const backendRes = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!backendRes.ok) {
      const errText = await backendRes.text();
      console.error("Backend error:", errText);
      return NextResponse.json(
        { error: "Backend error", details: errText },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
