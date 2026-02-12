<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import HouseIcon from "@lucide/svelte/icons/house";
  import UsersIcon from "@lucide/svelte/icons/users";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import RequestIcon from "@lucide/svelte/icons/clipboard-list";
  import ListenersIcon from "@lucide/svelte/icons/headphones";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import NavUser from "$lib/components/nav-user.svelte";
  import { authClient } from "$lib/auth-client";
  import { page } from "$app/stores";

  const session = authClient.useSession();

  const items = [
    {
      title: "Home",
      url: "/manage/dashboard/home",
      icon: HouseIcon,
      active: true,
    },
    {
      title: "Shows",
      url: "/manage/dashboard/shows",
      icon: CalendarIcon,
    },
    {
      title: "Users",
      url: "/manage/dashboard/users",
      icon: UsersIcon,
    },
    {
      title: "Requests",
      url: "/manage/dashboard/requests",
      icon: RequestIcon,
    },
    {
      title: "Listeners",
      url: "/manage/dashboard/listeners",
      icon: ListenersIcon,
    },
    {
      title: "Settings",
      url: "/manage/dashboard/settings",
      icon: SettingsIcon,
    },
  ];
</script>

<Sidebar.Root collapsible="icon" variant="floating">
  <Sidebar.Content>
    <div class="flex items-center justify-center flex-col">
      <img
        src="/assets/logo-removebg.png"
        alt="JHRADIO Logo"
        class="w-10 h-10 mx-auto mt-4"
      />
    </div>

    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {#each items as item (item.title)}
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive={$page.url.pathname.includes(item.url)}>
                {#snippet child({ props })}
                  <a href={item.url} {...props}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          {/each}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>

  <Sidebar.Footer>
    {#if $session.data}
      <NavUser
        user={{
          name: $session.data.user.name ?? "Unknown",
          email: $session.data.user.email ?? "",
          avatar: "",
        }}
      />
    {:else}
      <NavUser
        user={{
          name: "Guest",
          email: "",
          avatar: "",
        }}
      />
    {/if}
  </Sidebar.Footer>
</Sidebar.Root>
