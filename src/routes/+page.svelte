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

  const { data }: { data: { nowPlaying: NowPlaying } } = $props();
  
  let nowPlaying = $state<NowPlaying | null>(null);
  let ws = $state<WebSocket | null>(null);
  let currentSongId = $state<string | null>(null);
  let songStartTime = $state(0);
  let initialElapsed = $state(0);
  let timer = $state<ReturnType<typeof setInterval> | null>(null);
  let currentTime = $state(0);
  let playerScale = $state(0.85);
  let playerOpacity = $state(0);
  let coverHovered = $state(false);
  let isPlaying = $state(false);
  let volume = $state(0.8);
  let audioEl = $state<HTMLAudioElement | null>(null);
  let _duration = $state(0);
  let _artUrl = $state("/fallback-cover.png");
  let _progress = $state(0);

  $effect(() => {
    _duration = nowPlaying?.now_playing.duration || 0;
  });

  $effect(() => {
    _artUrl = nowPlaying?.now_playing.song.art
      ? nowPlaying.now_playing.song.art.startsWith("/")
        ? `https://azura.jessehoekema.com${nowPlaying.now_playing.song.art}`
        : nowPlaying.now_playing.song.art
      : "/fallback-cover.png";
  });

  $effect(() => {
    _progress = _duration > 0 ? Math.min((currentTime / _duration) * 100, 100) : 0;
  });

  const artUrl = $derived(_artUrl);
  const duration = $derived(_duration);
  const progress = $derived(_progress);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function updateLocalTime() {
    if (!nowPlaying || songStartTime === 0) return;
    const secondsSinceStart = Math.floor((Date.now() - songStartTime) / 1000);
    currentTime = Math.min(initialElapsed + secondsSinceStart, _duration);
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

  function togglePlayPause() {
    if (!audioEl) return;
    if (isPlaying) {
      audioEl.pause();
    } else {
      audioEl.play();
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

  $effect(() => {
    nowPlaying = data?.nowPlaying ?? null;
  });

  $effect(() => {
    if (!audioEl) return;
    
    const handlePlay = () => {
      isPlaying = true;
    };
    const handlePause = () => {
      isPlaying = false;
    };
    const handleEnded = () => {
      isPlaying = false;
    };

    audioEl.addEventListener('play', handlePlay);
    audioEl.addEventListener('pause', handlePause);
    audioEl.addEventListener('ended', handleEnded);
    
    isPlaying = !audioEl.paused;

    return () => {
      audioEl?.removeEventListener('play', handlePlay);
      audioEl?.removeEventListener('pause', handlePause);
      audioEl?.removeEventListener('ended', handleEnded);
    };
  });

  onMount(() => {
    // dev(s) thi button bypasses the autoplay restrictions also loop until audio is playing
    let playTries = 0;
    function tryPlayAudio() {
      if (!audioEl) return;
      audioEl.play().then(() => {
        isPlaying = true;
      }).catch(() => {
        if (playTries < 10 && !isPlaying) {
          playTries++;
          setTimeout(tryPlayAudio, 400);
        }
      });
    }
    tryPlayAudio();
    const hackPlayButton = document.getElementById("hack-btn-play") as HTMLButtonElement;
    hackPlayButton?.click();
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

<div class="fixed top-5 right-5 z-30">
  <img src="/assets/logo-removebg.png" alt="JHRADIO logo" class="w-14">
</div>

<div class="fixed top-5 left-5 z-30">
  <MenuButton />
</div>

{#if nowPlaying}
  {#key nowPlaying.now_playing.song.id}
    <div
      class="fixed bottom-15 left-15 right-20 z-30 flex items-end gap-8 player-container"
      style="transform: scale({playerScale}) translateY({coverHovered ? '-12px' : '0'}); opacity: {playerOpacity}; transition: transform 0.45s cubic-bezier(.22,1,.36,1), opacity 1.2s cubic-bezier(.22,1,.36,1);"
      onmouseenter={() => coverHovered = true}
      onmouseleave={() => coverHovered = false}
      role="region"
      aria-label="Now playing player"
    >
      <div 
        class="relative flex flex-col items-center cover-wrapper"
      >
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
        <button
          class="play-button-overlay"
          class:visible={coverHovered}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          onclick={togglePlayPause}
        >
          {#if isPlaying}
            <Pause class="w-10 h-10 text-white/90" />
          {:else}
            <Play class="w-10 h-10 text-white/90" />
          {/if}
        </button>
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
    </div>
  {/key}
{/if}


<!-- button for autoplay bypass -->
<button onclick={togglePlayPause} id="hack-btn-play" style="opacity: 0;">.</button>
<audio src={config.AZURA_MP3} id="audio-src" bind:this={audioEl} {volume}></audio>

<style>
  .cover-wrapper {
    position: relative;
  }

  .play-button-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(42, 42, 42, 0.4);
    backdrop-filter: blur(8px);
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s, transform 0.3s;
    z-index: 40;
    box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.25);
  }

  .play-button-overlay.visible {
    opacity: 1;
    pointer-events: auto;
    transform: translate(-50%, -50%) scale(1.08);
  }

  .play-button-overlay:hover {
    background: rgba(0, 0, 0, 0.35);
    transform: translate(-50%, -50%) scale(1.12);
  }

  .progress {
    height: 100%;
    border-radius: 999px;
    transition: width 0.3s ease-out;
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