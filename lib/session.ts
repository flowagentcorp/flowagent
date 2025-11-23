import { getIronSession, IronSessionOptions } from "iron-session";
import { cookies } from "next/headers";

// 👇 Toto rozšíri typ session tak, aby TS vedel, že session.user existuje
declare module "iron-session" {
  interface IronSessionData {
    user?: {
      agent_id?: string;
      email?: string;
    };
  }
}

export const sessionOptions: IronSessionOptions = {
  cookieName: "agent_session",
  password: process.env.SESSION_PASSWORD!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  },
};

// 🚀 Toto je moderný spôsob pre Next.js App Router
export async function getSession() {
  const cookieStore = cookies(); // App Router cookie manager
  const session = await getIronSession(cookieStore, sessionOptions);
  return session;
}
