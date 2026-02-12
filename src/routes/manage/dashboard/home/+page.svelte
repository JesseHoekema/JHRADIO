<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import AppSidebar from "$lib/components/Sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import CalendarClockIcon from "@lucide/svelte/icons/calendar-clock";
  import ClipboardListIcon from "@lucide/svelte/icons/clipboard-list";
  import ListenersIcon from "@lucide/svelte/icons/headphones";
  import MusicIcon from "@lucide/svelte/icons/music";
  import { timeAgo } from "$lib/azura";
  import type { PageData } from "./$types";
  import { goto } from "$app/navigation";
  import { openLastFm } from "$lib/azura";

  const { data }: { data: PageData } = $props();

  const isCurrentShow = (title: string) =>
    title.trim().toLowerCase() === data.currentShow?.trim().toLowerCase();
</script>

<Sidebar.Provider>
  <AppSidebar />
  <main class="z-10 flex-1 w-full">
    <Sidebar.Trigger />
    <div class="flex-1 overflow-y-auto p-6 pt-2">
      <h1 class="text-2xl font-semibold mb-2">Home</h1>
      <p class="text-sm text-muted-foreground mb-4">
        Quick overview of radio stats.
      </p>
      <div class="grid w-full grid-cols-1 gap-4 place-items-stretch sm:grid-cols-2 lg:grid-cols-4">
        <Card.Root class="w-full hover:shadow-xl transition-shadow duration-200 ">
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <ListenersIcon class="h-5 w-5 text-muted-foreground shrink-0" />
              <span>Listeners</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="text-2xl font-bold">{data.listenersTotal}</p>
          </Card.Content>
        </Card.Root>
        <Card.Root class="w-full hover:shadow-xl transition-shadow duration-200 ">
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <CalendarClockIcon class="h-5 w-5 text-muted-foreground shrink-0" />
              <span>Current Show</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="text-2xl font-bold">{data.currentShow}</p>
          </Card.Content>
        </Card.Root>
        <Card.Root class="w-full hover:shadow-xl transition-shadow duration-200 ">
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <ClipboardListIcon class="h-5 w-5 text-muted-foreground shrink-0" />
              <span>Requests Today</span>
            </Card.Title>
          </Card.Header>
          <Card.Content><p class="text-2xl font-bold">{data.requestedSongs.length}</p></Card.Content>
        </Card.Root>
        <Card.Root class="w-full hover:shadow-xl transition-shadow duration-200 ">
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <MusicIcon class="h-5 w-5 text-muted-foreground shrink-0" />
              <span>Now Playing</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="text-lg sm:text-lg font-bold line-clamp-1">
              {data.nowPlaying.now_playing.song.title} - {data.nowPlaying.now_playing.song.artist}
            </p>
          </Card.Content>
        </Card.Root>
      </div>
      <div class="mt-6">
        <Card.Root class="w-full hover:shadow-xl transition-shadow duration-200 ">
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <CalendarClockIcon class="h-5 w-5 text-muted-foreground shrink-0" />
              <span>Today's Schedule</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <ul class="space-y-1 text-sm">
              {#each data.daySchedule.sort((a, b) => a.from.getTime() - b.from.getTime()) as item }
                <li
                  class={`flex items-center justify-between gap-4 rounded-md px-2 py-1 ${
                    isCurrentShow(item.title) ? "bg-primary/10" : ""
                  }`}
                >
                  <span
                    class={
                      isCurrentShow(item.title)
                        ? "text-foreground/80"
                        : "text-muted-foreground"
                    }
                  >
                    {item.from.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    -
                    {item.to.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span
                    class={isCurrentShow(item.title) ? "font-semibold" : "font-medium"}
                  >
                    {item.title}
                  </span>
                </li>
              {/each}
            </ul>
          </Card.Content>
        </Card.Root>
      </div>
      <div class="mt-6">
        <Card.Root class="w-full hover:shadow-xl transition-shadow duration-200 ">
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <MusicIcon class="h-5 w-5 text-muted-foreground shrink-0" />
              <span>Recently Played</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <ul class="space-y-2 text-sm">
              {#each data.recentlyPlayed.slice(0, 6) as item}
                <button onclick={() => openLastFm(item.song.artist, item.song.title)} class="w-full text-left rounded-md px-2 py-1 hover:bg-secondary/50 transition-color cursor-pointer">
                  <li class="flex items-center justify-between gap-4">
                    <span class="font-medium line-clamp-1">
                      {item.song.title} - {item.song.artist}
                    </span>
                    <span class="text-muted-foreground shrink-0">
                      {timeAgo(item.played_at)}
                    </span>
                  </li>
                </button>
              {/each}
            </ul>
          </Card.Content>
        </Card.Root>
      </div>
      
    </div>
  </main>
</Sidebar.Provider>
