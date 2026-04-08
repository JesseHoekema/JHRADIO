<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";

  type User = {
    id: string;
    name: string;
    email: string;
  };

  const { user, onDeleted } = $props<{ user: User; onDeleted: (id: string) => void }>();

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
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });

      const payload = await response.json();
      if (!response.ok) {
        error = payload.message ?? "Failed to delete user.";
        return;
      }

      onDeleted(user.id);
      open = false;
    } catch (err) {
      error = "Failed to delete user.";
    } finally {
      isSubmitting = false;
    }
  };
</script>

<Dialog.Root bind:open={open}>
  <Dialog.Trigger class={buttonVariants({ variant: "destructive", size: "sm" })}>
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
        <Dialog.Title>Delete user</Dialog.Title>
        <Dialog.Description>
          This will permanently remove <strong>{user.name}</strong> ({user.email}). All their sessions will be deleted. This action cannot be undone.
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
          Delete user
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
