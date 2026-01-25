<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import type { NowPlaying } from "$lib/azura";
	import { config } from "$lib/azura";

	let { children, data }: { children: any; data: { nowPlaying?: NowPlaying } } = $props();

	const AZURA_WS_URL = `wss://${config.AZURA_BASE_URL.replace(/^https?:\/\//, "")}/api/live/nowplaying/websocket`;
	const STATION_NAME = config.AZURA_STATION;

	let nowPlaying = $state<NowPlaying | null>(null);
	let ws: WebSocket | null = null;
	let currentSongId: string | null = null;
	let playerOpacity = $state(0);

	const artUrl = $derived(
		nowPlaying?.now_playing.song.art
			? nowPlaying.now_playing.song.art.startsWith("/")
				? `https://azura.jessehoekema.com${nowPlaying.now_playing.song.art}`
				: nowPlaying.now_playing.song.art
			: "/fallback-cover.png"
	);

	function handleSseData(ssePayload: any) {
		const jsonData = ssePayload.data;
		if (!jsonData?.np) return;

		const newData: NowPlaying = jsonData.np;
		const newSongId = newData.now_playing.song.id;

		if (newSongId !== currentSongId) {
			nowPlaying = newData;
			currentSongId = newSongId;
		} else {
			nowPlaying = newData;
		}
	}

	function connectWebSocket() {
		ws = new WebSocket(AZURA_WS_URL);

		ws.onopen = () => {
			ws?.send(
				JSON.stringify({
					subs: {
						[`station:${STATION_NAME}`]: { recover: true },
					},
				}),
			);
		};

		ws.onmessage = (e) => {
			try {
				const jsonData = JSON.parse(e.data);

				if ("connect" in jsonData) {
					const connectData = jsonData.connect;

					if (connectData.data) {
						connectData.data.forEach(handleSseData);
					} else if (connectData.subs) {
						Object.values(connectData.subs).forEach((sub: any) => {
							sub.publications?.forEach(handleSseData);
						});
					}
				} else if ("pub" in jsonData) {
					handleSseData(jsonData.pub);
				}
			} catch (err) {
				console.error("WebSocket message error:", err);
			}
		};

		ws.onclose = () => {
			setTimeout(connectWebSocket, 2000);
		};
	}

	onMount(() => {
		// Initialize with data from props
		if (data.nowPlaying) {
			nowPlaying = data.nowPlaying;
			currentSongId = data.nowPlaying.now_playing.song.id;
		}
		
		connectWebSocket();

		setTimeout(() => {
			playerOpacity = 1;
		}, 50);

		return () => {
			ws?.close();
		};
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#key artUrl}
	<div
		class="blurred-background"
		style="background-image: url('{artUrl}'); opacity: {playerOpacity};"
		transition:fade={{ duration: 1200, easing: (t) => 1 - Math.pow(1 - t, 3) }}
	></div>
{/key}
<div class="fixed inset-0 z-0 bg-black/50" transition:fade={{ duration: 1200, easing: (t) => 1 - Math.pow(1 - t, 3) }}></div>

{@render children()}

<style>
	.blurred-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		filter: blur(20px) brightness(0.5);
		transform: scale(1.1);
		transition: opacity 1.2s cubic-bezier(0.22, 1, 0.36, 1);
		z-index: 0;
	}
</style>