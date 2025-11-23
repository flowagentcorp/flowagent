// lib/session.ts
import { getIronSession } from "iron-session";
import type { IronSessionOptions } from "iron-session";

export type SessionUser = {
  agent_id?: string;
  email?: string;
};

export const sessionOptions: IronSessionOptions = {
  cookieName: "agent_session",
  password: process.env.SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

// IMPORTANT: must accept NextRequest + NextResponse
export function getSession(req: Request | any, res: any) {
  return getIronSession(req, res, sessionOptions);
}
