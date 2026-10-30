import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "./users";

// Placeholder for real login: the browser only remembers a user id.
const COOKIE = "grabby_user_id";

export async function getCurrentUser() {
  const id = (await cookies()).get(COOKIE)?.value;
  return id ? getUser(id) : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/onboarding");
  return user;
}

export async function setCurrentUser(id: string) {
  (await cookies()).set(COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
