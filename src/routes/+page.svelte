<script lang="ts">
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";
  import type { NowPlaying } from "$lib/azura";
  import { config } from "$lib/azura";
  import { Play, Pause } from "@lucide/svelte";
  import MenuButton from "$lib/components/MenuButton.svelte";

  const AZURA_WS_URL = `wss://${config.AZURA_BASE_URL.replace(/^https?:\/\//, "")}/api/live/nowplaying/websocket`;
  const STATION_NAME = config.AZURA_STATION;
  const UPDATE_INTERVAL = 1000;

  export let data: { nowPlaying: NowPlaying };
  let nowPlaying: NowPlaying | null = data?.nowPlaying ?? null;
  let ws: WebSocket | null = null;
  let currentSongId: string | null = null;
  let songStartTime: number = 0;
  let initialElapsed: number = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let currentTime: number = 0;
  let playerScale = 0.85;
  let playerOpacity = 0;
  let playerHovered = false;
  let isPlaying = true; // For demo, toggle with button
  let volume = 0.8;
  let audioEl: HTMLAudioElement | null = null;

  $: artUrl = nowPlaying?.now_playing.song.art
    ? nowPlaying.now_playing.song.art.startsWith("/")
      ? `https://azura.jessehoekema.com${nowPlaying.now_playing.song.art}`
      : nowPlaying.now_playing.song.art
    : "/fallback-cover.png";

  $: duration = nowPlaying?.now_playing.duration || 0;
  $: progress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function updateLocalTime() {
    if (!nowPlaying || songStartTime === 0) return;
    const secondsSinceStart = Math.floor((Date.now() - songStartTime) / 1000);
    currentTime = Math.min(initialElapsed + secondsSinceStart, duration);
  }

  function resetTimingWithData(data: NowPlaying) {
    nowPlaying = data;
    currentSongId = data.now_playing.song.id;
    initialElapsed = data.now_playing.elapsed;
    songStartTime = Date.now();
    currentTime = initialElapsed;
  }

  function handleSseData(ssePayload: any) {
    const jsonData = ssePayload.data;
    if (!jsonData?.np) return;

    const newData: NowPlaying = jsonData.np;
    const newSongId = newData.now_playing.song.id;

    if (newSongId !== currentSongId) {
      resetTimingWithData(newData);
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
    if (nowPlaying) {
      resetTimingWithData(nowPlaying);
    }
    connectWebSocket();
    timer = setInterval(updateLocalTime, UPDATE_INTERVAL);

    setTimeout(() => {
      playerScale = 1;
      playerOpacity = 1;
    }, 50);

    return () => {
      ws?.close();
      if (timer) clearInterval(timer);
    };
  });
</script>

{#key artUrl}
  <div
    class="blurred-backgroud"
    style="background-image: url('{artUrl}'); opacity: {playerOpacity};"
    transition:fade={{ duration: 1200, easing: (t) => 1 - Math.pow(1 - t, 3) }}
  ></div>
{/key}
<div class="absolute inset-0 z-0 bg-black/50"></div>

<div class="fixed top-5 left-5 z-30">
  <MenuButton />
</div>

{#if nowPlaying}
  {#key nowPlaying.now_playing.song.id}
    <div
      class="fixed bottom-15 left-15 right-20 z-30 flex items-end gap-8 group"
      style="transform: scale({playerScale}) translateY({playerHovered ? '-24px' : '0'}); opacity: {playerOpacity}; transition: transform 0.45s cubic-bezier(.22,1,.36,1), opacity 1.2s cubic-bezier(.22,1,.36,1);"
      on:mouseenter={() => playerHovered = true}
      on:mouseleave={() => playerHovered = false}
      role="region"
      aria-label="Now playing player"
    >
      <div class="relative flex flex-col items-center">
        {#key nowPlaying.now_playing.song.id}
          <img
            class="w-64 h-64 rounded-lg shadow-2xl"
            src={artUrl}
            alt="Album cover"
            transition:fade={{
              duration: 900,
              easing: (t) => 1 - Math.pow(1 - t, 3),
            }}
          />
        {/key}
      </div>
      <div class="info pb-4 flex-1">
        {#key nowPlaying.now_playing.song.id}
          <div
            class="text-white font-sans text-6xl font-bold mb-2"
            transition:slide={{ duration: 400 }}
          >
            {nowPlaying.now_playing.song.title}
          </div>
          <div
            class="subtitle text-gray-300 text-lg mb-6"
            transition:slide={{ duration: 400 }}
          >
            {nowPlaying.now_playing.song.artist}
          </div>
        {/key}
        <div class="timeline">
          <div class="progress bg-gray-400" style="width: {progress}%"></div>
        </div>
        <div
          class="time-labels flex justify-between text-gray-400 text-sm mt-2"
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <button
        class="player-below-btn-abs opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        on:click={() => isPlaying = !isPlaying}
        style="position: absolute; left: 50%; transform: translateX(-50%); bottom: -60px;"
      >
        {#if isPlaying}
          <Pause class="w-10 h-10 text-white/90 " />
        {:else}
          <Play class="w-10 h-10 text-white/90 " />
        {/if}
      </button>
      <div
        class="volume-slider-abs opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300"
        style="position: absolute; right: 0; left: auto; bottom: -60px; display: flex; align-items: center; gap: 0.5rem; min-width: 120px; justify-content: flex-end;"
      >
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          bind:value={volume}
          on:input={() => { if (audioEl) audioEl.volume = volume; }}
          aria-label="Volume"
          class="volume-slider-bar"
        />
        <span class="text-white/70 text-xs font-medium" style="width: 2.5rem; text-align: right;">{Math.round(volume * 100)}%</span>
      </div>
    </div>
  {/key}
{/if}

<audio src={config.AZURA_MP3} id="audio-src" bind:this={audioEl} {volume}></audio>

<style>
  .volume-slider-abs {
    background: rgba(0,0,0,0.22);
    border-radius: 999px;
    box-shadow: 0 4px 24px 0 #0004;
    padding: 0.6rem 1.2rem 0.6rem 1.2rem;
    z-index: 40;
    height: 48px;
    min-width: 120px;
    max-width: 180px;
    transition: opacity 0.3s, transform 0.3s;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .volume-slider-bar {
    accent-color: #9147ff;
    width: 70px;
    height: 4px;
    border-radius: 999px;
    background: #fff2;
    outline: none;
    margin-right: 0.5rem;
    transition: background 0.2s;
  }

  .progress {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease-out;
  }

  .player-below-btn-abs {
    background: rgba(0,0,0,0.22);
    border-radius: 999px;
    transition: opacity 0.3s, transform 0.3s;
    outline: none;
    border: none;
    z-index: 40;
    cursor: pointer;
    box-shadow: 0 4px 24px 0 #0004;
    padding: 0.7rem 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .group:hover .player-below-btn-abs {
    opacity: 1 !important;
    pointer-events: auto !important;
    transform: translate(-50%, -20px) scale(1.08) !important;
  }

  .subtitle {
    opacity: 0.9;
    font-weight: 400;
  }

  .timeline {
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 999px;
    overflow: hidden;
    width: 100%;
  }

  .time-labels {
    font-weight: 400;
  }

  .blurred-backgroud {
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
