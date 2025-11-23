// app/api/user/me/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const response = new NextResponse();
  const session = await getSession(request, response);

  return NextResponse.json({
    user: session.user || null,
  });
}
