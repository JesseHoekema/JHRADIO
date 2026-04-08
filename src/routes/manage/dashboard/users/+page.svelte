<script lang="ts">
  import AppSidebar from "$lib/components/Sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import AddIcon from "@lucide/svelte/icons/plus";
  import MailIcon from "@lucide/svelte/icons/mail";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import DeleteUserDialog from "./DeleteUserDialog.svelte";
  import type { PageData } from "./$types";

  type User = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
    image: string | null;
  };

  const props = $props<{ data: PageData }>();
  const data = $derived(props.data);

  let users = $state<User[]>([]);
  let seededUsers = $state(false);
  let createOpen = $state(false);
  let createName = $state("");
  let createEmail = $state("");
  let createPassword = $state("");
  let createError = $state("");
  let isCreating = $state(false);

  $effect(() => {
    if (!seededUsers && data?.users) {
      users = data.users as User[];
      seededUsers = true;
    }
    if (createOpen) {
      createName = "";
      createEmail = "";
      createPassword = "";
      createError = "";
    }
  });

  const handleCreate = async () => {
    createError = "";
    const name = createName.trim();
    const email = createEmail.trim().toLowerCase();
    const password = createPassword;

    if (!name) {
      createError = "Name is required.";
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      createError = "A valid email is required.";
      return;
    }
    if (!password || password.length < 8) {
      createError = "Password must be at least 8 characters.";
      return;
    }

    isCreating = true;
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        createError = payload.message ?? "Failed to create user.";
        return;
      }

      const created: User = payload.user;
      users = [created, ...users];
      createOpen = false;
    } catch (error) {
      createError = "Failed to create user.";
    } finally {
      isCreating = false;
    }
  };

  const handleDeleted = (id: string) => {
    users = users.filter((u) => u.id !== id);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
</script>

<Sidebar.Provider>
  <AppSidebar />
  <main class="z-10 w-full flex-1 overflow-y-auto">
    <Sidebar.Trigger class="mt-1" />
    <div class="flex-1 overflow-y-auto p-6 pt-2">
      <h1 class="text-2xl font-semibold mb-2">Users</h1>
      <p class="text-sm text-muted-foreground mb-4">
        Manage admin accounts. Create new users or remove existing ones.
      </p>

      {#if users.length === 0}
        <Card.Root class="w-full">
          <Card.Header>
            <Card.Title>No users yet</Card.Title>
            <Card.Description>Create your first user to get started.</Card.Description>
          </Card.Header>
        </Card.Root>
      {:else}
        {#each users as user (user.id)}
          <Card.Root class="w-full mb-4 hover:shadow-xl transition-shadow duration-200">
            <Card.Header>
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0"
                >
                  {getInitials(user.name)}
                </div>
                <div class="min-w-0 flex-1">
                  <Card.Title class="flex items-center gap-2">
                    {user.name}
                    {#if user.id === data.currentUserId}
                      <span
                        class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                        >You</span
                      >
                    {/if}
                  </Card.Title>
                  <Card.Description class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span class="inline-flex items-center gap-1">
                      <MailIcon class="w-3.5 h-3.5" />
                      {user.email}
                    </span>
                    {#if user.emailVerified}
                      <span class="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <ShieldCheckIcon class="w-3.5 h-3.5" />
                        Verified
                      </span>
                    {/if}
                    <span class="text-muted-foreground">
                      Joined {formatDate(user.createdAt)}
                    </span>
                  </Card.Description>
                </div>
              </div>
            </Card.Header>
            <Card.Content class="flex flex-wrap gap-2">
              {#if user.id !== data.currentUserId}
                <DeleteUserDialog {user} onDeleted={handleDeleted} />
              {/if}
            </Card.Content>
          </Card.Root>
        {/each}
      {/if}

      <Dialog.Root bind:open={createOpen}>
        <Dialog.Trigger
          class={`${buttonVariants({ variant: "default" })} fixed top-8 right-6`}
        >
          <AddIcon class="w-4 h-4" />New User
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
              <Dialog.Title>New user</Dialog.Title>
              <Dialog.Description>
                Create a new admin account. They will be able to access the management
                dashboard.
              </Dialog.Description>
            </Dialog.Header>
            <div class="grid gap-4">
              <div class="grid gap-2">
                <Label for="create-name">Name</Label>
                <Input id="create-name" name="name" placeholder="John Doe" bind:value={createName} />
              </div>
              <div class="grid gap-2">
                <Label for="create-email">Email</Label>
                <Input
                  id="create-email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  bind:value={createEmail}
                />
              </div>
              <div class="grid gap-2">
                <Label for="create-password">Password</Label>
                <Input
                  id="create-password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  bind:value={createPassword}
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
                Create user
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  </main>
</Sidebar.Provider>