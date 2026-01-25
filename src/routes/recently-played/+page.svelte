<script lang="ts">
    import { Music } from "@lucide/svelte";
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
      fullJson: any;
    };

</script>
<div class="fixed top-5 left-5 z-20">
  <MenuButton />
</div>
<div class="centered-box">
  <div class="box-content">
    <h1 class="text-3xl font-bold flex gap-2"><Music class="w-8 h-8 mt-1" /> Recently Played</h1>
    {#each data.recentlyPlayed as entry}
    <button class="unstyled-button" on:click={() => openLastFm(entry.song.artist, entry.song.title)}>
      <div class="bg-black/30 border-white/20 border-1 hover:bg-black/40 hover:translate-y-[-2px] hover:cursor-pointer transition-all duration-200 w-full px-3 py-3 mt-4 rounded-lg flex items-left justify-left">
        <div class="flex flex-col justify-center">
          <img src={entry.song.art} alt={entry.song.title} class="w-16 h-16 rounded-lg ml-2 bg-white" />
        </div>
        <div class="ml-4 flex flex-col justify-center">
          <h2 class="text-white font-semibold text-base">{entry.song.title}</h2>
          <p class="text-white/70 text-sm">{entry.song.artist}{entry.song.album ? ` — ${entry.song.album}` : ''}</p>
          <p class="text-white/70 text-xs">Show: {entry.playlist}</p>
        </div>
        <div class="flex flex-col justify-center ml-auto text-white/70 text-sm">
          {timeAgo(entry.played_at)}
        </div>
      </div>
    </button>
    {/each}

    <!-- <details class="w-full mt-8">
      <summary class="cursor-pointer text-white/80">Show full JSON response</summary>
      <pre class="bg-black/60 text-white text-xs rounded-lg p-4 overflow-x-auto mt-2">{JSON.stringify(data, null, 2)}</pre>
    </details> -->
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
  }
  .box-content {
    margin-top: 48px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #fff;
    width: 800px;
    box-sizing: border-box;
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
