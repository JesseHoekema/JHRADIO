<script lang="ts">
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import AppSidebar from "$lib/components/Sidebar.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import UserIcon from "@lucide/svelte/icons/user";
  import KeyIcon from "@lucide/svelte/icons/key";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import type { PageData } from "./$types";

  const { data }: { data: PageData } = $props();

  let name = $state("");
  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");

  let nameLoading = $state(false);
  let passwordLoading = $state(false);
  let signOutLoading = $state(false);

  let nameSuccess = $state("");
  let nameError = $state("");
  let passwordSuccess = $state("");
  let passwordError = $state("");

  onMount(() => {
    name = data.user?.name ?? "";
  });

  async function updateName() {
    nameLoading = true;
    nameError = "";
    nameSuccess = "";

    try {
      const { error } = await authClient.updateUser({
        name,
      });

      if (error) {
        nameError = error.message || "Failed to update name";
      } else {
        nameSuccess = "Name updated successfully";
      }
    } catch (err) {
      nameError = "An error occurred";
    } finally {
      nameLoading = false;
    }
  }

  async function updatePassword() {
    passwordLoading = true;
    passwordError = "";
    passwordSuccess = "";

    if (newPassword !== confirmPassword) {
      passwordError = "Passwords do not match";
      passwordLoading = false;
      return;
    }

    if (newPassword.length < 8) {
      passwordError = "Password must be at least 8 characters";
      passwordLoading = false;
      return;
    }

    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (error) {
        passwordError = error.message || "Failed to change password";
      } else {
        passwordSuccess = "Password changed successfully";
        currentPassword = "";
        newPassword = "";
        confirmPassword = "";
      }
    } catch (err) {
      passwordError = "An error occurred";
    } finally {
      passwordLoading = false;
    }
  }

  async function signOut() {
    signOutLoading = true;
    try {
      await authClient.signOut();
      await goto("/manage/sign-in");
    } catch (err) {
      signOutLoading = false;
    }
  }
</script>

<Sidebar.Provider>
  <AppSidebar />
  <main class="z-10 flex-1 w-full">
    <Sidebar.Trigger />
    <div class="flex-1 overflow-y-auto p-6 pt-2">
      <h1 class="text-2xl font-semibold mb-2">Settings</h1>
      <p class="text-sm text-muted-foreground mb-6">
        Manage your profile and account settings.
      </p>

      <div class="w-full space-y-6">
        <!-- Profile Card -->
        <Card.Root
          class="w-full hover:shadow-xl transition-shadow duration-200"
        >
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <UserIcon class="h-5 w-5 text-muted-foreground" />
              <span>Profile</span>
            </Card.Title>
            <Card.Description>
              Update your display name and profile information.
            </Card.Description>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={data.user?.email ?? ""}
                disabled
                class="bg-muted"
              />
              <p class="text-xs text-muted-foreground">
                Email cannot be changed.
              </p>
            </div>
            <div class="space-y-2">
              <Label for="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                bind:value={name}
                placeholder="Your display name"
              />
            </div>
            {#if nameError}
              <p class="text-sm text-destructive">{nameError}</p>
            {/if}
            {#if nameSuccess}
              <p class="text-sm text-green-500">{nameSuccess}</p>
            {/if}
          </Card.Content>
          <Card.Footer>
            <Button onclick={updateName} disabled={nameLoading}>
              {nameLoading ? "Saving..." : "Save Changes"}
            </Button>
          </Card.Footer>
        </Card.Root>

        <!-- Password Card -->
        <Card.Root
          class="w-full hover:shadow-xl transition-shadow duration-200"
        >
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <KeyIcon class="h-5 w-5 text-muted-foreground" />
              <span>Change Password</span>
            </Card.Title>
            <Card.Description>
              Update your password to keep your account secure.
            </Card.Description>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="space-y-2">
              <Label for="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                bind:value={currentPassword}
                placeholder="Enter current password"
              />
            </div>
            <div class="space-y-2">
              <Label for="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                bind:value={newPassword}
                placeholder="Enter new password"
              />
            </div>
            <div class="space-y-2">
              <Label for="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                bind:value={confirmPassword}
                placeholder="Confirm new password"
              />
            </div>
            {#if passwordError}
              <p class="text-sm text-destructive">{passwordError}</p>
            {/if}
            {#if passwordSuccess}
              <p class="text-sm text-green-500">{passwordSuccess}</p>
            {/if}
          </Card.Content>
          <Card.Footer>
            <Button onclick={updatePassword} disabled={passwordLoading}>
              {passwordLoading ? "Updating..." : "Update Password"}
            </Button>
          </Card.Footer>
        </Card.Root>

        <!-- Sign Out Card -->
        <Card.Root
          class="w-full hover:shadow-xl transition-shadow duration-200 border-destructive/20"
        >
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <LogOutIcon class="h-5 w-5 text-destructive" />
              <span>Sign Out</span>
            </Card.Title>
            <Card.Description>
              Sign out of your account on this device.
            </Card.Description>
          </Card.Header>
          <Card.Footer>
            <Button
              variant="destructive"
              onclick={signOut}
              disabled={signOutLoading}
            >
              {signOutLoading ? "Signing out..." : "Sign Out"}
            </Button>
          </Card.Footer>
        </Card.Root>
      </div>
    </div>
  </main>
</Sidebar.Provider>
