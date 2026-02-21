import type { RequestEvent } from "@sveltejs/kit";
import { fetchListeners, fetchBestWorstSongs } from "$lib/azura";
import { auth } from "$lib/auth";
import { redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export const load = async ({ request }: RequestEvent) => {
  const result = await auth.api.getSession({
    headers: request.headers,
  });

  if (!result) {
    throw redirect(302, "/manage/sign-in");
  }

  const apiKey = env.AZURA_API_KEY;

  if (!apiKey) {
    return {
      error: "AZURA_API_KEY not configured in .env",
      stats: null,
      bestWorst: null,
      mostPlayed: null,
    };
  }

  try {
    const [stats, reportsData] = await Promise.all([
      fetchListeners(apiKey),
      fetchBestWorstSongs(apiKey).catch((err) => {
        console.error("Failed to fetch reports:", err);
        return null;
      }),
    ]);

    return {
      error: null,
      stats,
      bestWorst: reportsData?.bestAndWorst ?? null,
      mostPlayed: reportsData?.mostPlayed ?? null,
    };
  } catch (err) {
    console.error("Failed to fetch listeners:", err);
    return {
      error: "Failed to fetch listener data",
      stats: null,
      bestWorst: null,
      mostPlayed: null,
    };
  }
};
