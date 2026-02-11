import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getShowById } from "$lib/management";

export const GET: RequestHandler = async ({ url }) => {
  const idParam = url.searchParams.get("id");
  const id = idParam ? Number(idParam) : NaN;

  if (!Number.isFinite(id)) {
    return json({ error: "Id parameter required" }, { status: 400 });
  }

  const show = await getShowById(String(id));
  if (!show) {
    return json({ error: "Show not found" }, { status: 404 });
  }

  return json({ id: show.id, name: show.name });
};
