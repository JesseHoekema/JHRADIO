<script lang="ts">
  import AppSidebar from "$lib/components/Sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import DeleteRequestDialog from "./DeleteRequestDialog.svelte";

  type RequestItem = {
    id: number;
    name: string;
    songId: string;
    songName: string;
    description: string | null;
    notes: string | null;
    requestedAt: string;
  };

  const props = $props<{ data: { requests: RequestItem[] } }>();
  const data = $derived(props.data);

  let requests = $state<RequestItem[]>([]);
  let seededRequests = $state(false);

  $effect(() => {
    if (!seededRequests && data?.requests) {
      requests = data.requests;
      seededRequests = true;
    }
  });

  const groupedRequests = $derived(
    (() => {
      const groups = new Map<string, RequestItem[]>();
      requests.forEach((item) => {
        const date = new Date(item.requestedAt);
        const label = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const list = groups.get(label) ?? [];
        list.push(item);
        groups.set(label, list);
      });
      return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
    })(),
  );

  const handleDeleted = (id: number) => {
    requests = requests.filter((item) => item.id !== id);
  };
</script>

<Sidebar.Provider>
  <AppSidebar />
  <main class="z-10 w-full flex-1 overflow-y-auto">
    <Sidebar.Trigger class="mt-1" />
    <div class="flex-1 overflow-y-auto p-6 pt-2">
      <h1 class="text-2xl font-semibold mb-2">Requests</h1>
      <p class="text-sm text-muted-foreground mb-4">
        Review incoming song requests and remove entries when needed.
      </p>

      {#if groupedRequests.length === 0}
        <Card.Root class="w-full">
          <Card.Header>
            <Card.Title>No requests yet</Card.Title>
            <Card.Description>Requests will appear here once they are submitted.</Card.Description>
          </Card.Header>
        </Card.Root>
      {:else}
        {#each groupedRequests as group (group.label)}
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-3">{group.label}</h2>
            <div class="space-y-4">
              {#each group.items as item (item.id)}
                <Card.Root class="w-full">
                  <Card.Header>
                    <Card.Title>{item.songName}</Card.Title>
                    <Card.Description>Requested by {item.name}</Card.Description>
                  </Card.Header>
                  <Card.Content class="space-y-2">
                    <div class="text-sm text-muted-foreground">
                      Requested at {new Date(item.requestedAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {#if item.description}
                      <div class="text-sm">{item.description}</div>
                    {/if}
                    {#if item.notes}
                      <div class="text-sm text-muted-foreground">{item.notes}</div>
                    {/if}
                    <div class="flex flex-wrap gap-2">
                      <DeleteRequestDialog {item} onDeleted={handleDeleted} />
                    </div>
                  </Card.Content>
                </Card.Root>
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </main>
</Sidebar.Provider>