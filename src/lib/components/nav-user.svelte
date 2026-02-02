<script lang="ts">
  import BadgeCheckIcon from "@lucide/svelte/icons/badge-check";
  import BellIcon from "@lucide/svelte/icons/bell";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import CreditCardIcon from "@lucide/svelte/icons/credit-card";
  import LogOutIcon from "@lucide/svelte/icons/log-out";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import * as Avatar from "$lib/components/ui/avatar/index.js";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import { useSidebar } from "$lib/components/ui/sidebar/index.js";
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";
  let {
    user,
  }: {
    user: {
      name: string;
      email: string;
      avatar: string;
    };
  } = $props();
  const sidebar = useSidebar();
</script>
<Sidebar.Menu>
  <Sidebar.MenuItem>
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        {#snippet child({ props })}
          <Sidebar.MenuButton
            {...props}
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar.Root class="size-8 rounded-lg">
              <Avatar.Image src={user.avatar} alt={user.name} />
              <Avatar.Fallback class="rounded-lg">{user.name ? user.name.charAt(0) : ""}</Avatar.Fallback>
            </Avatar.Root>
            <div class="grid flex-1 text-start text-sm leading-tight">
              <span class="truncate font-medium">{user.name}</span>
              <span class="truncate text-xs">{user.email}</span>
            </div>
            <ChevronsUpDownIcon class="ms-auto size-4" />
          </Sidebar.MenuButton>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
        side={sidebar.isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <button onclick={() => { authClient.signOut(); goto("/"); }} class="w-full unstyled-button">
            <DropdownMenu.Item >
              <LogOutIcon />
              Log out
            </DropdownMenu.Item>
        </button>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </Sidebar.MenuItem>
</Sidebar.Menu>