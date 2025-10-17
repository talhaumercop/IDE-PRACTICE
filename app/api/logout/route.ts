import { NextResponse } from "next/server";
import { auth } from "@/auth"; // adjust path if your auth file is elsewhere
import { signOut } from "next-auth/react";

export async function POST() {
  try {
    // You can’t directly call signOut() on the server.
    // So instead, just clear the session cookie manually.
    const response = NextResponse.json({ message: "Logged out successfully" });
    response.cookies.set("authjs.session-token", "", {
      expires: new Date(0),
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Logout failed:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
