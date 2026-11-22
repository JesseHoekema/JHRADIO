<script lang="ts">
  import { Music, TreePine } from "@lucide/svelte";
  import { timeAgo, openLastFm } from "$lib/azura";
  import MenuButton from "$lib/components/MenuButton.svelte";

  export let data: {
    recentlyPlayed: Array<{
      playlist: string;
      played_at: number;
      song: {
        art: string;
        title: string;
        artist: string;
        album: string;
        album_art_url: string;
      };
    }>;
    christmasRecentlyPlayed: Array<{
      playlist: string;
      played_at: number;
      song: {
        art: string;
        title: string;
        artist: string;
        album: string;
        album_art_url: string;
      };
    }>;
    christmasEnabled: boolean;
    fullJson: any;
  };
</script>

<div class="fixed top-5 left-5 z-20">
  <MenuButton />
</div>
<div class="centered-box">
  <div class="box-content">
    <h1 class="text-3xl font-bold flex gap-2">
      <Music class="w-8 h-8 mt-1" /> Recently Played
    </h1>
    {#each data.recentlyPlayed as entry}
      <button
        class="unstyled-button"
        on:click={() => openLastFm(entry.song.artist, entry.song.title)}
      >
        <div
          class="bg-black/30 border-white/20 border-1 hover:bg-black/40 hover:translate-y-[-2px] hover:cursor-pointer transition-all duration-200 w-full px-3 py-3 mt-4 rounded-lg flex items-left justify-left"
        >
          <div class="flex flex-col justify-center">
            <img
              src={entry.song.art}
              alt={entry.song.title}
              class="w-16 h-16 rounded-lg ml-2 bg-white"
            />
          </div>
          <div class="ml-4 flex flex-col justify-center">
            <h2 class="text-white font-semibold text-base">
              {entry.song.title}
            </h2>
            <p class="text-white/70 text-sm">
              {entry.song.artist}{entry.song.album
                ? ` — ${entry.song.album}`
                : ""}
            </p>
            <p class="text-white/70 text-xs">Show: {entry.playlist}</p>
          </div>
          <div
            class="flex flex-col justify-center ml-auto text-white/70 text-sm"
          >
            {timeAgo(entry.played_at)}
          </div>
        </div>
      </button>
    {/each}

    {#if data.christmasEnabled && data.christmasRecentlyPlayed.length > 0}
      <h2 class="text-2xl font-bold flex gap-2 mt-10">
        <TreePine class="w-7 h-7 mt-1" /> Christmas Station
      </h2>
      {#each data.christmasRecentlyPlayed as entry}
        <button
          class="unstyled-button"
          on:click={() => openLastFm(entry.song.artist, entry.song.title)}
        >
          <div
            class="bg-red-950/30 border-red-500/20 border-1 hover:bg-red-950/40 hover:translate-y-[-2px] hover:cursor-pointer transition-all duration-200 w-full px-3 py-3 mt-4 rounded-lg flex items-left justify-left"
          >
            <div class="flex flex-col justify-center">
              <img
                src={entry.song.art}
                alt={entry.song.title}
                class="w-16 h-16 rounded-lg ml-2 bg-white"
              />
            </div>
            <div class="ml-4 flex flex-col justify-center">
              <h2 class="text-white font-semibold text-base">
                {entry.song.title}
              </h2>
              <p class="text-white/70 text-sm">
                {entry.song.artist}{entry.song.album
                  ? ` — ${entry.song.album}`
                  : ""}
              </p>
              <p class="text-red-400/70 text-xs">Show: {entry.playlist}</p>
            </div>
            <div
              class="flex flex-col justify-center ml-auto text-white/70 text-sm"
            >
              {timeAgo(entry.played_at)}
            </div>
          </div>
        </button>
      {/each}
    {/if}
  </div>
</div>

<style>
  .centered-box {
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    min-height: 100vh;
    background: transparent;
    z-index: 10;
    padding: 4.5rem 1rem 1rem;
    box-sizing: border-box;
  }

  .box-content {
    margin-top: 36px;
    background: transparent;
    backdrop-filter: none;
    border-radius: 0;
    border: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #fff;
    width: 100%;
    max-width: 800px;
    box-sizing: border-box;
  }

  @media (min-width: 640px) {
    .centered-box {
      padding: 0;
    }

    .box-content {
      margin-top: 48px;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(8px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 2rem;
    }
  }

  .unstyled-button {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    width: 100%;
    text-align: left;
    cursor: pointer;
  }
</style>
