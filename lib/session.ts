// lib/session.ts
import { getIronSession, IronSession } from "iron-session";
import type { SessionOptions } from "iron-session";

export type SessionUser = {
  agent_id?: string;
  email?: string;
};

export const sessionOptions: SessionOptions = {
  cookieName: "agent_session",
  password: process.env.SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

export function getSession(req: Request | any, res: any) {
  return getIronSession<SessionUser>(req, res, sessionOptions);
}
