<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";

  type RequestItem = {
    id: number;
    name: string;
    songId: string;
    songName: string;
    description: string | null;
    notes: string | null;
    requestedAt: string;
  };

  const props = $props<{ item: RequestItem; onDeleted: (id: number) => void }>();
  const item = $derived(props.item);
  const onDeleted = props.onDeleted;

  let open = $state(false);
  let error = $state("");
  let isSubmitting = $state(false);

  $effect(() => {
    if (open) {
      error = "";
    }
  });

  const handleDelete = async () => {
    error = "";
    isSubmitting = true;
    try {
      const response = await fetch("/api/admin/removerequest", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });

      const payload = await response.json();
      if (!response.ok) {
        error = payload.message ?? "Failed to delete request.";
        return;
      }

      onDeleted(item.id);
      open = false;
    } catch (err) {
      error = "Failed to delete request.";
    } finally {
      isSubmitting = false;
    }
  };
</script>

<Dialog.Root bind:open={open}>
  <Dialog.Trigger class={buttonVariants({ variant: "destructive" })}>
    Delete
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[480px]">
    <form
      onsubmit={(event) => {
        event.preventDefault();
        handleDelete();
      }}
      class="grid gap-4"
    >
      <Dialog.Header>
        <Dialog.Title>Delete request</Dialog.Title>
        <Dialog.Description>
          This will permanently remove the request for {item.songName}.
        </Dialog.Description>
      </Dialog.Header>
      {#if error}
        <p class="text-sm text-destructive">{error}</p>
      {/if}
      <Dialog.Footer>
        <Dialog.Close type="button" class={buttonVariants({ variant: "outline" })}>
          Cancel
        </Dialog.Close>
        <Button type="submit" variant="destructive" disabled={isSubmitting}>
          Delete request
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
