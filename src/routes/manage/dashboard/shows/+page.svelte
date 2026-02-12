<script lang="ts">
  import AppSidebar from "$lib/components/Sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import AddIcon from "@lucide/svelte/icons/plus";
  import EditShowDialog from "./EditShowDialog.svelte";
  import DeleteShowDialog from "./DeleteShowDialog.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  type Show = {
    id: number;
    name: string;
    description: string | null;
  };

  const props = $props<{ data: { shows: Show[] } }>();
  const data = $derived(props.data);

  let shows = $state<Show[]>([]);
  let seededShows = $state(false);
  let createOpen = $state(false);
  let createName = $state("");
  let createDescription = $state("");
  let createError = $state("");
  let isCreating = $state(false);

  const editId = $derived.by(() => {
    const value = $page.url.searchParams.get("edit");
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  });

  $effect(() => {
    if (!seededShows && data?.shows) {
      shows = data.shows;
      seededShows = true;
    }
    if (createOpen) {
      createName = "";
      createDescription = "";
      createError = "";
    }
  });

  const handleCreate = async () => {
    createError = "";
    const name = createName.trim();
    const description = createDescription.trim();

    if (!name) {
      createError = "Show name is required.";
      return;
    }

    isCreating = true;
    try {
      const response = await fetch("/api/admin/createshow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      const payload = await response.json();
      if (!response.ok) {
        createError = payload.message ?? "Failed to create show.";
        return;
      }

      const created: Show = payload.show;
      shows = [created, ...shows];
      createOpen = false;
    } catch (error) {
      createError = "Failed to create show.";
    } finally {
      isCreating = false;
    }
  };

  const handleUpdated = (updated: Show) => {
    shows = shows.map((show) => (show.id === updated.id ? updated : show));

    if ($page.url.searchParams.get("edit") === String(updated.id)) {
      const nextUrl = new URL($page.url);
      nextUrl.searchParams.delete("edit");
      goto(`${nextUrl.pathname}${nextUrl.search}`, { replaceState: true });
    }
  };

  const handleDeleted = (id: number) => {
    shows = shows.filter((show) => show.id !== id);
  };
</script>

<Sidebar.Provider>
  <AppSidebar />
  <main class="z-10 w-full flex-1 overflow-y-auto">
    <Sidebar.Trigger class="mt-1" />
    <div class="flex-1 overflow-y-auto p-6 pt-2">
      <h1 class="text-2xl font-semibold mb-2">Shows</h1>
      <p class="text-sm text-muted-foreground mb-4">
        Create, edit, and delete shows for the station lineup.
      </p>
      {#if shows.length === 0}
        <Card.Root class="w-full">
          <Card.Header>
            <Card.Title>No shows yet</Card.Title>
            <Card.Description>Add your first show to get started.</Card.Description>
          </Card.Header>
        </Card.Root>
      {:else}
        {#each shows as show (show.id)}
          <Card.Root class="w-full mb-4">
            <Card.Header>
              <Card.Title>{show.name}</Card.Title>
              <Card.Description>{show.description ?? "No description yet."}</Card.Description>
            </Card.Header>
            <Card.Content class="flex flex-wrap gap-2">
              <EditShowDialog
                {show}
                onUpdated={handleUpdated}
                forceOpen={editId === show.id}
              />
              <DeleteShowDialog {show} onDeleted={handleDeleted} />
            </Card.Content>
          </Card.Root>
        {/each}
      {/if}

      <Dialog.Root bind:open={createOpen}>
        <Dialog.Trigger
          class={`${buttonVariants({ variant: "default" })} fixed top-8 right-6`}
        >
          <AddIcon class="w-4 h-4" />New Show
        </Dialog.Trigger>
        <Dialog.Content class="sm:max-w-[480px]">
          <form
            onsubmit={(event) => {
              event.preventDefault();
              handleCreate();
            }}
            class="grid gap-4"
          >
            <Dialog.Header>
              <Dialog.Title>New show</Dialog.Title>
              <Dialog.Description>
                Add a new show to the schedule. You can update it later.
              </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="create-name">Show name</Label>
                <Input id="create-name" name="name" bind:value={createName} />
              </div>
              <div class="grid gap-2">
                <Label for="create-description">Description</Label>
                <Input
                  id="create-description"
                  name="description"
                  bind:value={createDescription}
                />
              </div>
              {#if createError}
                <p class="text-sm text-destructive">{createError}</p>
              {/if}
            </div>
            <Dialog.Footer>
              <Dialog.Close type="button" class={buttonVariants({ variant: "outline" })}>
                Cancel
              </Dialog.Close>
              <Button type="submit" disabled={isCreating}>
                Create show
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  </main>
</Sidebar.Provider>