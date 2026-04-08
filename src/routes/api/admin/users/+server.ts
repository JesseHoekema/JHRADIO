import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { auth } from "$lib/auth";
import { prisma } from "$lib/prisma";

const requireSession = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return null;
  }

  return session.user;
};

export const GET: RequestHandler = async ({ request }) => {
  const user = await requireSession(request);

  if (!user) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      createdAt: true,
      image: true,
    },
  });

  return json({ users });
};

export const POST: RequestHandler = async ({ request }) => {
  const actor = await requireSession(request);

  if (!actor) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password } = await request.json();

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  const trimmedPassword = typeof password === "string" ? password : "";

  if (!trimmedName) {
    return json({ message: "Name is required." }, { status: 400 });
  }
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return json({ message: "A valid email is required." }, { status: 400 });
  }
  if (!trimmedPassword || trimmedPassword.length < 8) {
    return json({ message: "Password must be at least 8 characters." }, { status: 400 });
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
    },
    headers: request.headers,
  });

  if (!result || !result.user) {
    return json({ message: "Failed to create user." }, { status: 500 });
  }

  return json({ user: result.user }, { status: 201 });
};

export const DELETE: RequestHandler = async ({ request }) => {
  const actor = await requireSession(request);

  if (!actor) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  if (!id || typeof id !== "string") {
    return json({ message: "User id is required." }, { status: 400 });
  }

  if (id === actor.id) {
    return json({ message: "You cannot delete your own account." }, { status: 400 });
  }

  await prisma.user.delete({
    where: { id },
  });

  return json({ success: true });
};
