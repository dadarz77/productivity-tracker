import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User, LocalUser } from "@db/schema";
import { authenticateRequest } from "./kimi/auth";
import { verifyLocalToken } from "./local-auth-utils";

export type UnifiedUser = {
  id: number;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role: "user" | "admin";
  authType: "oauth" | "local";
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: UnifiedUser;
};

function oauthToUnified(u: User): UnifiedUser {
  return {
    id: u.id,
    name: u.name || "User",
    email: u.email,
    avatar: u.avatar,
    role: (u.role as "user" | "admin") || "user",
    authType: "oauth",
  };
}

function localToUnified(u: LocalUser): UnifiedUser {
  return {
    id: u.id + 100000,
    name: u.displayName || u.username,
    email: u.email,
    avatar: u.avatar,
    role: (u.role as "user" | "admin") || "user",
    authType: "local",
  };
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Try OAuth first
  try {
    const oauthUser = await authenticateRequest(opts.req.headers);
    if (oauthUser) {
      ctx.user = oauthToUnified(oauthUser);
      return ctx;
    }
  } catch {
    // OAuth not available
  }

  // Try local auth
  try {
    const token = opts.req.headers.get("x-local-auth-token");
    if (token) {
      const localUser = await verifyLocalToken(token);
      if (localUser) {
        ctx.user = localToUnified(localUser);
      }
    }
  } catch {
    // Local auth not available
  }

  return ctx;
}
