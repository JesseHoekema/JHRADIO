<script lang="ts">
  import AppSidebar from "$lib/components/Sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import HeadphonesIcon from "@lucide/svelte/icons/headphones";
  import UsersIcon from "@lucide/svelte/icons/users";
  import ClockIcon from "@lucide/svelte/icons/clock";
  import GlobeIcon from "@lucide/svelte/icons/globe";
  import TrendingUpIcon from "@lucide/svelte/icons/trending-up";
  import TrendingDownIcon from "@lucide/svelte/icons/trending-down";
  import MusicIcon from "@lucide/svelte/icons/music";
  import { formatDuration, formatListenHours, config } from "$lib/azura";
  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  function getArtUrl(art: string | null): string {
    if (!art) return "/fallback-cover.png";
    return art.startsWith("/") ? `${config.AZURA_BASE_URL}${art}` : art;
  }

  function getSongArtUrl(songId: string): string {
    return `${config.AZURA_BASE_URL}/api/station/${config.AZURA_STATION}/art/${songId}`;
  }
</script>

<Sidebar.Provider>
  <AppSidebar />
  <main class="z-10 flex-1 w-full">
    <Sidebar.Trigger />
    <div class="flex-1 overflow-y-auto p-6 pt-2">
      <h1 class="text-2xl font-semibold mb-2">Listeners</h1>
      <p class="text-sm text-muted-foreground mb-4">
        Real-time listener statistics and details.
      </p>

      {#if data.error}
        <Card.Root class="w-full">
          <Card.Content class="pt-6">
            <p class="text-destructive">{data.error}</p>
            {#if data.error === "AZURA_API_KEY not configured in .env"}
              <p class="text-sm text-muted-foreground mt-2">
                Add AZURA_API_KEY to your .env file to enable listener tracking.
              </p>
            {/if}
          </Card.Content>
        </Card.Root>
      {:else if data.stats}
        <div
          class="grid w-full grid-cols-1 gap-4 place-items-stretch sm:grid-cols-2 lg:grid-cols-3"
        >
          <Card.Root
            class="w-full hover:shadow-xl transition-shadow duration-200"
          >
            <Card.Header>
              <Card.Title class="flex items-center gap-2">
                <HeadphonesIcon
                  class="h-5 w-5 text-muted-foreground shrink-0"
                />
                <span>Current Listeners</span>
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p class="text-3xl font-bold">{data.stats.currentListeners}</p>
            </Card.Content>
          </Card.Root>

          <Card.Root
            class="w-full hover:shadow-xl transition-shadow duration-200"
          >
            <Card.Header>
              <Card.Title class="flex items-center gap-2">
                <UsersIcon class="h-5 w-5 text-muted-foreground shrink-0" />
                <span>Unique Listeners</span>
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p class="text-3xl font-bold">{data.stats.uniqueListeners}</p>
            </Card.Content>
          </Card.Root>

          <Card.Root
            class="w-full hover:shadow-xl transition-shadow duration-200"
          >
            <Card.Header>
              <Card.Title class="flex items-center gap-2">
                <ClockIcon class="h-5 w-5 text-muted-foreground shrink-0" />
                <span>Total Listen Time</span>
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p class="text-3xl font-bold">
                {formatListenHours(data.stats.totalListenTime)}
              </p>
            </Card.Content>
          </Card.Root>
        </div>
        <div class="mt-6">
          <Card.Root
            class="w-full hover:shadow-xl transition-shadow duration-200"
          >
            <Card.Header>
              <Card.Title class="flex items-center gap-2">
                <GlobeIcon class="h-5 w-5 text-muted-foreground shrink-0" />
                <span>All Listeners ({data.stats.listeners.length})</span>
              </Card.Title>
            </Card.Header>
            <Card.Content>
              {#if data.stats.listeners.length === 0}
                <p class="text-muted-foreground text-center py-8">
                  No listeners connected
                </p>
              {:else}
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b">
                        <th
                          class="text-left py-2 px-2 font-medium text-muted-foreground"
                          >Location</th
                        >
                        <th
                          class="text-left py-2 px-2 font-medium text-muted-foreground"
                          >Client</th
                        >
                        <th
                          class="text-left py-2 px-2 font-medium text-muted-foreground"
                          >Device</th
                        >
                        <th
                          class="text-left py-2 px-2 font-medium text-muted-foreground"
                          >Mount</th
                        >
                        <th
                          class="text-right py-2 px-2 font-medium text-muted-foreground"
                          >Connected</th
                        >
                      </tr>
                    </thead>
                    <tbody>
                      {#each data.stats.listeners as listener}
                        <tr
                          class="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                        >
                          <td class="py-2 px-2">
                            <span class="font-medium">
                              {listener.location?.description ||
                                listener.location?.country ||
                                "Unknown"}
                            </span>
                          </td>
                          <td class="py-2 px-2 text-muted-foreground">
                            {listener.device?.client || "Unknown"}
                          </td>
                          <td class="py-2 px-2">
                            {#if listener.device?.is_mobile}
                              <span
                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-500"
                              >
                                Mobile
                              </span>
                            {:else if listener.device?.is_browser}
                              <span
                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-500"
                              >
                                Browser
                              </span>
                            {:else}
                              <span
                                class="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-500/10 text-gray-500"
                              >
                                Other
                              </span>
                            {/if}
                          </td>
                          <td class="py-2 px-2 text-muted-foreground">
                            {listener.mount_name || "/radio.mp3"}
                          </td>
                          <td
                            class="py-2 px-2 text-right font-mono text-muted-foreground"
                          >
                            {formatDuration(listener.connected_time)}
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              {/if}
            </Card.Content>
          </Card.Root>
        </div>

        {#if data.bestWorst}
          <div class="grid w-full grid-cols-1 gap-4 mt-6 lg:grid-cols-2">
            <Card.Root
              class="w-full hover:shadow-xl transition-shadow duration-200"
            >
              <Card.Header>
                <Card.Title class="flex items-center gap-2">
                  <TrendingUpIcon class="h-5 w-5 text-green-500 shrink-0" />
                  <span>Best Performing</span>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                {#if data.bestWorst.best && data.bestWorst.best.length > 0}
                  <ul class="space-y-2">
                    {#each data.bestWorst.best.slice(0, 5) as song, i}
                      <li
                        class="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/30 transition-colors"
                      >
                        <span
                          class="text-sm font-medium text-muted-foreground w-4"
                          >{i + 1}</span
                        >
                        <img
                          src={getSongArtUrl(song.song.id)}
                          alt={song.song.title}
                          class="w-10 h-10 rounded object-cover"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="font-medium truncate">{song.song.title}</p>
                          <p class="text-sm text-muted-foreground truncate">
                            {song.song.artist}
                          </p>
                        </div>
                        <span class="text-green-500 font-medium text-sm">
                          +{song.stat_delta}
                        </span>
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <p class="text-muted-foreground text-center py-4">
                    No data available
                  </p>
                {/if}
              </Card.Content>
            </Card.Root>

            <Card.Root
              class="w-full hover:shadow-xl transition-shadow duration-200"
            >
              <Card.Header>
                <Card.Title class="flex items-center gap-2">
                  <TrendingDownIcon class="h-5 w-5 text-red-500 shrink-0" />
                  <span>Worst Performing</span>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                {#if data.bestWorst.worst && data.bestWorst.worst.length > 0}
                  <ul class="space-y-2">
                    {#each data.bestWorst.worst.slice(0, 5) as song, i}
                      <li
                        class="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/30 transition-colors"
                      >
                        <span
                          class="text-sm font-medium text-muted-foreground w-4"
                          >{i + 1}</span
                        >
                        <img
                          src={getSongArtUrl(song.song.id)}
                          alt={song.song.title}
                          class="w-10 h-10 rounded object-cover"
                        />
                        <div class="flex-1 min-w-0">
                          <p class="font-medium truncate">{song.song.title}</p>
                          <p class="text-sm text-muted-foreground truncate">
                            {song.song.artist}
                          </p>
                        </div>
                        <span class="text-red-500 font-medium text-sm">
                          {song.stat_delta}
                        </span>
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <p class="text-muted-foreground text-center py-4">
                    No data available
                  </p>
                {/if}
              </Card.Content>
            </Card.Root>
          </div>
        {/if}

        {#if data.mostPlayed && data.mostPlayed.length > 0}
          <div class="mt-6">
            <Card.Root
              class="w-full hover:shadow-xl transition-shadow duration-200"
            >
              <Card.Header>
                <Card.Title class="flex items-center gap-2">
                  <MusicIcon class="h-5 w-5 text-muted-foreground shrink-0" />
                  <span>Most Played Songs</span>
                </Card.Title>
              </Card.Header>
              <Card.Content>
                <div
                  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                  {#each data.mostPlayed.slice(0, 9) as song, i}
                    <div
                      class="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/30 transition-colors"
                    >
                      <span class="text-lg font-bold text-muted-foreground w-6"
                        >{i + 1}</span
                      >
                      <img
                        src={getSongArtUrl(song.song.id)}
                        alt={song.song.title}
                        class="w-12 h-12 rounded object-cover"
                      />
                      <div class="flex-1 min-w-0">
                        <p class="font-medium truncate">{song.song.title}</p>
                        <p class="text-sm text-muted-foreground truncate">
                          {song.song.artist}
                        </p>
                        <p class="text-xs text-muted-foreground">
                          {song.num_plays} plays
                        </p>
                      </div>
                    </div>
                  {/each}
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        {/if}
      {/if}
    </div>
  </main>
</Sidebar.Provider>
