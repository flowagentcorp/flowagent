// lib/session.ts
import { getIronSession, IronSession } from "iron-session";
import type { IronSessionOptions } from "iron-session";

export type SessionData = {
  user?: {
    agent_id: string;
    email: string;
  };
};

export const sessionOptions: IronSessionOptions = {
  cookieName: "agent_session",
  password: process.env.SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

// MUST PASS req + res (Next.js API route style)
export function getSession(req: Request, res: any): Promise<IronSession<SessionData>> {
  return getIronSession(req, res, sessionOptions);
}
