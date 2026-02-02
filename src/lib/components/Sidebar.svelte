<script lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import HouseIcon from "@lucide/svelte/icons/house";
  import UsersIcon from "@lucide/svelte/icons/users";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import NavUser from "$lib/components/nav-user.svelte";
  import { authClient } from "$lib/auth-client";

  const session = authClient.useSession();

  const items = [
    {
      title: "Home",
      url: "#",
      icon: HouseIcon,
    },
    {
      title: "Shows",
      url: "#",
      icon: CalendarIcon,
    },
    {
      title: "Users",
      url: "#",
      icon: UsersIcon,
    },
    {
      title: "Settings",
      url: "#",
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
              <Sidebar.MenuButton>
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
