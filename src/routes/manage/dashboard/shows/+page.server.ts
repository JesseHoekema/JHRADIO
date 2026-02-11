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

	const shows = await prisma.show.findMany({
		orderBy: { name: "asc" },
	});

	return { shows };
};
