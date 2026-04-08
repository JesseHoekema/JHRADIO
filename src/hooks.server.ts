import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { json, type Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });
  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }

  if (
    event.url.pathname === "/api/auth/sign-up/email" &&
    event.request.method === "POST" &&
    !session
  ) {
    return json({ message: "Unauthorized. Only admins can create accounts." }, { status: 401 });
  }

  return svelteKitHandler({ event, resolve, auth, building });
}
