import type { PageServerLoad } from "./$types";
import {
    getCurrentListeners,
    fetchNowPlaying,
    getCurrentShow,
    fetchTodaySchedule,
    fetchRecentlyPlayed
} from "$lib/azura";
import { getRequestedSongsByCurrentDate } from "$lib/azura.server";
import { auth } from "$lib/auth";
import { redirect } from "@sveltejs/kit";


export const load: PageServerLoad = async ({ request }) => {
    const result = await auth.api.getSession({
        headers: request.headers,
    });

    if (!result) {
        throw redirect(302, "/manage/sign-in");
    }
    const listenersTotal = await getCurrentListeners();
    const nowPlaying = await fetchNowPlaying();
    const requestedSongs = await getRequestedSongsByCurrentDate();
    const currentShow = await getCurrentShow();
    const daySchedule = await fetchTodaySchedule();
    const recentlyPlayed = await fetchRecentlyPlayed();

    return {
        listenersTotal,
        nowPlaying,
        requestedSongs,
        currentShow,
        daySchedule,
        recentlyPlayed
    };
};
