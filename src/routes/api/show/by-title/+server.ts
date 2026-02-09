import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getIdByShowTitle } from '$lib/management';

export const GET: RequestHandler = async ({ url }) => {
  const title = url.searchParams.get('title');
  
  if (!title) {
    return json({ error: 'Title parameter required' }, { status: 400 });
  }
  
  const id = await getIdByShowTitle(title);
  return json({ id });
};
