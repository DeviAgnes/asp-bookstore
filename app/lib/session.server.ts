import type { User, UserRole } from "@prisma/client";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { match } from "ts-pattern";

import { getUserById } from "~/lib/auth.server";
import { serverEnv } from "~/lib/env.server";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    httpOnly: true,
    maxAge: 0,
    name: "__bookstore_session",
    path: "/",
    sameSite: "lax",
    secrets: [serverEnv.SESSION_SECRET],
    secure: false,
  },
});

export const USER_SESSION_KEY = "userId";
const USER_ROLE_KEY = "userRole";
const fourteenDaysInSeconds = 60 * 60 * 24 * 14;
const thirtyDaysInSeconds = 60 * 60 * 24 * 30;

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

/**
 * Returns the userId from the session.
 */
export async function getUserId(request: Request): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId;
}

/**
 * Returns the userRole from the session.
 */
export async function getUserRole(request: Request): Promise<UserRole | undefined> {
  const session = await getSession(request);
  const userRole = session.get(USER_ROLE_KEY);
  return userRole;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) {
    return null;
  }

  const user = await getUserById(userId);
  if (user) {
    return user;
  }

  throw await logout(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect(`/login?redirectTo=${redirectTo}`);
  }

  return userId;
}

export async function requireUser(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await requireUserId(request, redirectTo);
  const user = await getUserById(userId);
  if (user) {
    return user;
  }

  throw await logout(request);
}

export async function createUserSession({
  redirectTo,
  remember = false,
  request,
  role,
  userId,
}: {
  redirectTo: string;
  remember?: boolean;
  request: Request;
  role: User["role"];
  userId: User["id"];
}) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, userId);
  session.set(USER_ROLE_KEY, role);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? thirtyDaysInSeconds : fourteenDaysInSeconds,
      }),
    },
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);

  // For some reason destroySession isn't removing session keys
  // So, unsetting the keys manually
  session.unset(USER_SESSION_KEY);
  session.unset(USER_ROLE_KEY);

  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

export async function validateUserRole(request: Request, roles: Array<UserRole> | null) {
  const existingUserRole = await getUserRole(request);

  if (!existingUserRole) {
    return redirect("/login");
  }

  if (roles?.includes(existingUserRole)) {
    return;
  }

  return redirectUser(existingUserRole);
}

const redirectUser = (role: UserRole) => {
  return match(role)
    .with("admin", () => {
      throw redirect("/admin");
    })
    .with("librarian", () => {
      throw redirect("/librarian");
    })
    .with("customer", () => {
      throw redirect("/");
    })
    .exhaustive();
};
