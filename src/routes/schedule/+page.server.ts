import type { PageServerLoad } from './$types';
import { fetchNowPlaying } from '$lib/azura';
import { prisma } from '$lib/prisma';

export const load: PageServerLoad = async () => {
  const nowPlaying = await fetchNowPlaying();
  const shows = await prisma.show.findMany({
    select: {
      name: true,
      description: true
    }
  });
  const showDescriptions = Object.fromEntries(
    shows.map((show) => [show.name.trim().toLowerCase(), show.description])
  );

  return { nowPlaying, showDescriptions };
};
