import type { PageServerLoad } from "./$types";
import { auth } from "$lib/auth";
import { prisma } from "$lib/prisma";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ request }) => {
	const result = await auth.api.getSession({
		headers: request.headers,
	});

	if (!result) {
		throw redirect(302, "/manage/sign-in");
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

	return { users, currentUserId: result.user.id };
};
