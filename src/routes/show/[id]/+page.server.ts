import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";
import { getShowById } from "$lib/management";
import { auth } from "$lib/auth";

export const load: PageServerLoad = async ({ params, request }) => {
  const show = await getShowById(params.id);

  if (!show) {
    throw error(404, "Show not found");
  }

  const session = await auth.api.getSession({
    headers: request.headers
  });

  return {
    show,
    isAdmin: Boolean(session)
  };
};
