import type { PageServerLoad } from './$types';
import { fetchNowPlaying } from '$lib/azura';

export const load: PageServerLoad = async () => {
  const nowPlaying = await fetchNowPlaying();
  return { nowPlaying };
};
