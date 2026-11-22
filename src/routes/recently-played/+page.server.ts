import { fetchRecentlyPlayed, fetchChristmasRecentlyPlayed } from "$lib/azura";
import { siteConfig } from "$lib/config";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
	const recentlyPlayed = await fetchRecentlyPlayed();
	const christmasRecentlyPlayed = siteConfig.christmasEnabled
		? await fetchChristmasRecentlyPlayed()
		: [];
	return {
		recentlyPlayed: recentlyPlayed.slice(0, 5),
		christmasRecentlyPlayed: christmasRecentlyPlayed.slice(0, 5),
		christmasEnabled: siteConfig.christmasEnabled,
	};
};
