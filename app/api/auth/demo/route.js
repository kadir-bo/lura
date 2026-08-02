import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const auth = getFirebaseAdminAuth();

    if (!auth) {
      return NextResponse.json(
        { error: "Demo access is not configured." },
        { status: 503 },
      );
    }

    // A new UID prevents prospective customers from seeing or changing each
    // other's chats, projects, and preferences.
    const uid = `demo-${randomUUID()}`;
    const token = await auth.createCustomToken(uid, { demo: true });
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Failed to create a demo token:", error);
    return NextResponse.json(
      { error: "Demo access is temporarily unavailable." },
      { status: 500 },
    );
  }
}
