import { fetchRecentlyPlayed } from "$lib/azura";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const recentlyPlayed = await fetchRecentlyPlayed();
	return { recentlyPlayed };
};