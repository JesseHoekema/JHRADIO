<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";

  type Show = {
    id: number;
    name: string;
    description: string | null;
  };

  const { show, onDeleted } = $props<{ show: Show; onDeleted: (id: number) => void }>();

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
      const response = await fetch("/api/admin/removeshow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: show.id }),
      });

      const payload = await response.json();
      if (!response.ok) {
        error = payload.message ?? "Failed to delete show.";
        return;
      }

      onDeleted(show.id);
      open = false;
    } catch (err) {
      error = "Failed to delete show.";
    } finally {
      isSubmitting = false;
    }
  };
</script>

<Dialog.Root bind:open={open}>
  <Dialog.Trigger class={buttonVariants({ variant: "destructive" })}>
    Delete Show
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
        <Dialog.Title>Delete show</Dialog.Title>
        <Dialog.Description>
          This will permanently remove {show.name}. This action cannot be undone.
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
          Delete show
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
