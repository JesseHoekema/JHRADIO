<script lang="ts">
  import { fly } from "svelte/transition";
  import { X, Menu, Calendar, Send, Music, Home, Shield } from "@lucide/svelte";
  import { authClient } from "$lib/auth-client";

  type Props = {
    variant?: "toolbar" | "glass";
  };

  let { variant = "toolbar" }: Props = $props();
  let menuState = $state(false);
  const session = authClient.useSession();

  function openPage(page: string) {
    switch (page) {
      case "home":
        window.location.href = "/";
        break;
      case "schedule":
        window.location.href = "/schedule";
        break;
      case "recently-played":
        window.location.href = "/recently-played";
        break;
      case "request":
        window.location.href = "/request";
        break;
      case "admin":
        window.location.href = "/manage/dashboard/home";
        break;
    }
    menuState = false;
  }
</script>

<div class="menu-wrapper" class:glass={variant === "glass"}>
  <button
    class="menu-toggle"
    class:glass={variant === "glass"}
    onclick={() => (menuState = !menuState)}
    aria-label="Menu"
  >
    {#if menuState}
      <X class="w-4 h-4" />
    {:else}
      <Menu class="w-4 h-4" />
    {/if}
  </button>
  {#if menuState}
    <div class="menu-items" class:glass={variant === "glass"}>
      <button
        transition:fly={{ x: -20, duration: 300, delay: 0 }}
        class="menu-item"
        class:glass={variant === "glass"}
        onclick={() => openPage("home")}
      >
        <Home class="w-4 h-4" />
        Home
      </button>
      <button
        transition:fly={{ x: -20, duration: 300, delay: 0 }}
        class="menu-item"
        class:glass={variant === "glass"}
        onclick={() => openPage("schedule")}
      >
        <Calendar class="w-4 h-4" />
        Schedule
      </button>
      <button
        transition:fly={{ x: -20, duration: 300, delay: 100 }}
        class="menu-item"
        class:glass={variant === "glass"}
        onclick={() => openPage("recently-played")}
      >
        <Music class="w-4 h-4" />
        Recently Played
      </button>
      <button
        transition:fly={{ x: -20, duration: 300, delay: 200 }}
        class="menu-item"
        class:glass={variant === "glass"}
        onclick={() => openPage("request")}
      >
        <Send class="w-4 h-4" />
        Request
      </button>
      {#if $session.data}
        <button
          transition:fly={{ x: -20, duration: 300, delay: 300 }}
          class="menu-item"
          class:glass={variant === "glass"}
          onclick={() => openPage("admin")}
        >
          <Shield class="w-4 h-4" />
          Admin
        </button>
      {/if}
      <button
        transition:fly={{ x: -20, duration: 300, delay: 400 }}
        class="menu-item"
        class:glass={variant === "glass"}
        onclick={() => (window.location.href = "/discord")}
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.222 0c1.406 0 2.54 1.137 2.607 2.475V24l-2.677-2.273-1.47-1.338-1.604-1.398.67 2.205H3.71c-1.402 0-2.54-1.065-2.54-2.476V2.48C1.17 1.142 2.31.003 3.715.003h16.5L20.222 0zm-6.118 5.683h-.03l-.202.2c2.073.6 3.076 1.537 3.076 1.537-1.336-.668-2.54-1.002-3.744-1.137-.87-.135-1.74-.064-2.475 0h-.2c-.47 0-1.47.2-2.81.735-.467.203-.735.336-.735.336s1.002-1.002 3.21-1.537l-.135-.135s-1.672-.064-3.477 1.27c0 0-1.805 3.144-1.805 7.02 0 0 1 1.74 3.743 1.806 0 0 .4-.533.805-1.002-1.54-.4-2.172-1.27-2.172-1.27s.135.064.335.2h.06c.03 0 .044.015.06.03v.006c.016.016.03.03.06.03.33.136.66.27.93.4.466.202 1.065.403 1.8.536.93.135 1.996.2 3.21 0 .6-.135 1.2-.267 1.8-.535.39-.2.87-.4 1.397-.737 0 0-.6.936-2.205 1.27.33.466.795 1 .795 1 2.744-.06 3.81-1.8 3.87-1.726 0-3.87-1.815-7.02-1.815-7.02-1.635-1.214-3.165-1.26-3.435-1.26l.056-.02zm.168 4.413c.703 0 1.27.6 1.27 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.34.002-.74.573-1.338 1.27-1.335zm-4.64 0c.7 0 1.266.6 1.266 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.34 0-.74.57-1.335 1.27-1.335z"
          />
        </svg>
        Discord
      </button>
    </div>
  {/if}
</div>

<style>
  .menu-wrapper {
    position: relative;
  }

  .menu-wrapper.glass {
    display: flex;
    align-items: flex-start;
  }

  .menu-toggle {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(42, 42, 42, 0.4);
    color: #9ca3af;
    border: 1px solid #3a3a3a;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s;
  }

  .menu-toggle:hover {
    background: #333;
    color: #e5e7eb;
    border-color: #4a4a4a;
  }

  .menu-toggle.glass {
    width: 36px;
    height: 36px;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    padding: 8px;
  }

  .menu-toggle.glass:hover {
    background: rgba(0, 0, 0, 0.3);
    color: rgba(255, 255, 255, 1);
  }

  .menu-items {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 50;
  }

  .menu-items.glass {
    position: static;
    margin-left: 0.75rem;
    flex-direction: row;
    gap: 0.75rem;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(42, 42, 42, 0.4);
    backdrop-filter: blur(8px);
    border: 1px solid #3a3a3a;
    border-radius: 8px;
    color: #9ca3af;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .menu-item:hover {
    background: #333;
    color: #e5e7eb;
    border-color: #4a4a4a;
  }

  .menu-item.glass {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.8);
    padding: 8px 16px;
    font-size: 0.875rem;
  }

  .menu-item.glass:hover {
    background: rgba(0, 0, 0, 0.4);
    color: rgba(255, 255, 255, 1);
    border-color: rgba(255, 255, 255, 0.2);
  }
</style>
