import type { PageServerLoad } from "./$types";
import { auth } from "$lib/auth";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ request }) => {
  const result = await auth.api.getSession({
    headers: request.headers,
  });

  if (!result) {
    throw redirect(302, "/manage/sign-in");
  }

  return {
    user: result.user,
  };
};
