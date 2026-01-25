<script lang="ts">
  import { fly } from "svelte/transition";
  import { X, Menu, Calendar, Send, Music } from "@lucide/svelte";

  let menuState = false;
</script>

<div class="fixed top-5 left-5 z-30 flex items-start">
  <button
    class="text-white/60 bg-black/10 backdrop-blur-sm border border-white/10 rounded-xl p-2 w-9 h-9 flex items-center justify-center transition-all duration-200 hover:text-white hover:bg-black/30"
    on:click={() => (menuState = !menuState)}
  >
    {#if menuState}
      <X class="inline-block w-4 h-4" />
    {:else}
      <Menu class="inline-block w-4 h-4" />
    {/if}
  </button>
  {#if menuState}
    <div class="ml-3 flex items-center gap-3">
      <button 
        transition:fly={{ x: -20, duration: 300, delay: 0 }}
        class="text-white/80 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 transition-all duration-200 hover:text-white hover:bg-black/40 hover:border-white/20 text-sm whitespace-nowrap"
      >
        <Calendar class="w-4 h-4" />
        Schedule
      </button>
      <button 
        transition:fly={{ x: -20, duration: 300, delay: 100 }}
        class="text-white/80 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 transition-all duration-200 hover:text-white hover:bg-black/40 hover:border-white/20 text-sm whitespace-nowrap"
      >
        <Music class="w-4 h-4" />
        Recently Played
      </button>
      <button 
        transition:fly={{ x: -20, duration: 300, delay: 200 }}
        class="text-white/80 bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2 transition-all duration-200 hover:text-white hover:bg-black/40 hover:border-white/20 text-sm whitespace-nowrap"
      >
        <Send class="w-4 h-4" />
        Request
      </button>
    </div>
  {/if}
</div>
