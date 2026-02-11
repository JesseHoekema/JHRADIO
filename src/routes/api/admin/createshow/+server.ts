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

export const POST: RequestHandler = async ({ request }) => {
	const user = await requireAdmin(request);

	if (!user) {
		return json({ message: "Unauthorized" }, { status: 401 });
	}

	const { name, description } = await request.json();
	const trimmedName = typeof name === "string" ? name.trim() : "";
	const trimmedDescription =
		typeof description === "string" ? description.trim() : "";

	if (!trimmedName) {
		return json({ message: "Show name is required" }, { status: 400 });
	}

	const show = await prisma.show.create({
		data: {
			name: trimmedName,
			description: trimmedDescription || null,
		},
	});

	return json({ show });
};

export const PUT: RequestHandler = async ({ request }) => {
	const user = await requireAdmin(request);

	if (!user) {
		return json({ message: "Unauthorized" }, { status: 401 });
	}

	const { id, name, description } = await request.json();
	const showId = Number(id);
	const trimmedName = typeof name === "string" ? name.trim() : "";
	const trimmedDescription =
		typeof description === "string" ? description.trim() : "";

	if (!Number.isFinite(showId)) {
		return json({ message: "Show id is required" }, { status: 400 });
	}

	if (!trimmedName) {
		return json({ message: "Show name is required" }, { status: 400 });
	}

	const show = await prisma.show.update({
		where: { id: showId },
		data: {
			name: trimmedName,
			description: trimmedDescription || null,
		},
	});

	return json({ show });
};
