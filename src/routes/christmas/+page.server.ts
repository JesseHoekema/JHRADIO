import type { PageServerLoad } from './$types';
import { fetchChristmasNowPlaying } from '$lib/azura';

export const load: PageServerLoad = async () => {
  const nowPlaying = await fetchChristmasNowPlaying();
  return { nowPlaying };
};
