<script lang="ts">
  import MenuButton from "$lib/components/MenuButton.svelte";
  import Dropdown from "$lib/components/Dropdown.svelte";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { onMount } from "svelte";
  import { getRequestableSongs, formatRequestableSongsToDropdown } from "$lib/azura";
  import { writable } from "svelte/store";
  import { Check } from "@lucide/svelte";

  const songs = writable<any[]>([]);
  const loading = writable(true);
  let checked = false;
  let name = "";
  let customSongRequest = "";
  let selectedSong = "";
  let notes = "";
  let isSubmitting = false;
  let error = "";
  let successMessage = "";

  // Reactive statement to calculate if form is valid
  $: isFormValid = !$loading &&
    name.trim() !== "" &&
    (checked ? customSongRequest.trim() !== "" : selectedSong !== "");

  // Clear alternate field when checkbox changes
  $: if (checked) {
    selectedSong = "";
  } else {
    customSongRequest = "";
  }

  async function submitRequest() {
    error = "";
    successMessage = "";
    if (!isFormValid) return;

    const songOption = $songs.find((song) => song.value === selectedSong);
    const songName = checked ? customSongRequest.trim() : (songOption?.label ?? "");
    const songId = checked ? "" : selectedSong;

    if (!songName) {
      error = "Please select or enter a song.";
      return;
    }

    isSubmitting = true;
    try {
      const response = await fetch("/api/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          songId,
          songName,
          description: checked ? customSongRequest.trim() : "",
          notes: notes.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        error = payload.message ?? "Request failed.";
        return;
      }

      successMessage = payload.message ?? "Request submitted.";
      name = "";
      selectedSong = "";
      customSongRequest = "";
      notes = "";
      checked = false;
    } catch (err) {
      error = "Request failed. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }

  onMount(async () => {
    const fetchedSongs = await getRequestableSongs();
    songs.set(formatRequestableSongsToDropdown(fetchedSongs));
    loading.set(false);
    console.log(fetchedSongs);
  });

</script>

<div class="fixed top-5 left-5 z-20">
  <MenuButton />
</div>
<div class="centered-box">
  <div class="box-content">
    <h1 class="text-3xl font-bold flex gap-2">Request</h1>

    <form
      class="w-full mt-6 flex flex-col gap-4"
      onsubmit={(event) => {
        event.preventDefault();
        submitRequest();
      }}
    >
      <div>
        <Label for="name" class="mb-1">Your Name</Label>
        <Input id="name" type="text" placeholder="Name" class="max-w-full" bind:value={name} />
      </div>
      <div class="w-full">
        <Label for="song-dropdown" class="mb-1">Select a song</Label>
        <Dropdown items={$songs} loading={$loading} bind:value={selectedSong} width="w-full" />
      </div>
      <div class="flex items-center gap-1">
        <Checkbox id="songnotfound" bind:checked={checked} />
        <Label for="songnotfound">Song not found?</Label>
      </div>
      {#if checked}
        <div>
          <Label for="song-request" class="mb-1">Request a song</Label>
          <Input id="song-request" type="text" placeholder="Song Name - Artist" class="max-w-full" bind:value={customSongRequest} />
          <p class="text-muted-foreground font-semibold text-xs mt-1">Note: when you request a song that is not found, it may take some time to be added.</p>
        </div>
      {/if}
      <div>
        <Label class="mb-1">Note (optional)</Label>
        <Textarea placeholder="Additional notes for your request..." class="w-full" bind:value={notes} />
      </div>
      {#if error}
        <div class="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      {/if}
      {#if successMessage}
        <div class="rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          {successMessage}
        </div>
      {/if}
      <Button type="submit" class="mt-4" disabled={!isFormValid || isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
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
</style>