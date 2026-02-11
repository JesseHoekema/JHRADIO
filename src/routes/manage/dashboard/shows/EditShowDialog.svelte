<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";

  type Show = {
    id: number;
    name: string;
    description: string | null;
  };

  const props = $props<{ show: Show; onUpdated: (show: Show) => void }>();
  const show = $derived(props.show);
  const onUpdated = props.onUpdated;

  let open = $state(false);
  let name = $state("");
  let description = $state("");
  let error = $state("");
  let isSubmitting = $state(false);

  $effect(() => {
    if (open) {
      name = show.name;
      description = show.description ?? "";
      error = "";
    }
  });

  const handleSubmit = async () => {
    error = "";
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      error = "Show name is required.";
      return;
    }

    isSubmitting = true;
    try {
      const response = await fetch("/api/admin/createshow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: show.id,
          name: trimmedName,
          description: trimmedDescription,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        error = payload.message ?? "Failed to update show.";
        return;
      }

      onUpdated(payload.show as Show);
      open = false;
    } catch (err) {
      error = "Failed to update show.";
    } finally {
      isSubmitting = false;
    }
  };
</script>

<Dialog.Root bind:open={open}>
  <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>
    Edit Show
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[480px]">
    <form
      onsubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      class="grid gap-4"
    >
      <Dialog.Header>
        <Dialog.Title>Edit show</Dialog.Title>
        <Dialog.Description>Update details for {show.name}.</Dialog.Description>
      </Dialog.Header>
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for={`edit-name-${show.id}`}>Show name</Label>
          <Input id={`edit-name-${show.id}`} name="name" bind:value={name} />
        </div>
        <div class="grid gap-2">
          <Label for={`edit-description-${show.id}`}>Description</Label>
          <Input
            id={`edit-description-${show.id}`}
            name="description"
            bind:value={description}
          />
        </div>
        {#if error}
          <p class="text-sm text-destructive">{error}</p>
        {/if}
      </div>
      <Dialog.Footer>
        <Dialog.Close type="button" class={buttonVariants({ variant: "outline" })}>
          Cancel
        </Dialog.Close>
        <Button type="submit" disabled={isSubmitting}>Save changes</Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
