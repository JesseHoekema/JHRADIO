import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { auth } from "$lib/auth";
import { prisma } from "$lib/prisma";

const requireAdmin = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return null;
  }

  return session.user;
};

export const DELETE: RequestHandler = async ({ request }) => {
  const user = await requireAdmin(request);

  if (!user) {
    return json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();
  const showId = Number(id);

  if (!Number.isFinite(showId)) {
    return json({ message: "Show id is required" }, { status: 400 });
  }

  await prisma.show.delete({
    where: { id: showId },
  });

  return json({ success: true });
};
