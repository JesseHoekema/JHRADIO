import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { getShowById } from "$lib/management";

export const load: PageServerLoad = async ({ params }) => {
	const show = await getShowById(params.id);

	if (!show) {
		throw error(404, "Show not found");
	}

	return { show };
};
