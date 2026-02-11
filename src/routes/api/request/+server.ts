import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/prisma";
import { requestSong } from "$lib/azura";

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const name = typeof body.name === "string" ? body.name.trim() : "";
	const songId = typeof body.songId === "string" ? body.songId.trim() : "";
	const songName = typeof body.songName === "string" ? body.songName.trim() : "";
	const description =
		typeof body.description === "string" ? body.description.trim() : "";
	const notes = typeof body.notes === "string" ? body.notes.trim() : "";

	if (!name || !songName) {
		return json(
			{ message: "Name and songName are required." },
			{ status: 400 },
		);
	}

	try {
		let azuraMessage = "Request received.";
		if (songId) {
			const azuraResponse = await requestSong(songId);
			if (!azuraResponse.success) {
				return json(
					{ message: azuraResponse.message || "Request failed." },
					{ status: 400 },
				);
			}
			azuraMessage = azuraResponse.message;
		}

		const saved = await prisma.request.create({
			data: {
				name,
				songId: songId || "custom",
				songName,
				description: description || null,
				notes: notes || null,
			},
		});

		return json({ success: true, request: saved, message: azuraMessage });
	} catch (error) {
		console.error("Request API error:", error);
		return json({ message: "Failed to submit request." }, { status: 500 });
	}
};
