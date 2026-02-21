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
    onclick={() => menuState = !menuState}
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
        onclick={() => openPage('home')}
      >
        <Home class="w-4 h-4" />
        Home
      </button>
      <button 
        transition:fly={{ x: -20, duration: 300, delay: 0 }}
        class="menu-item"
        class:glass={variant === "glass"}
        onclick={() => openPage('schedule')}
      >
        <Calendar class="w-4 h-4" />
        Schedule
      </button>
      <button 
        transition:fly={{ x: -20, duration: 300, delay: 100 }}
        class="menu-item"
        class:glass={variant === "glass"}
        onclick={() => openPage('recently-played')}
      >
        <Music class="w-4 h-4" />
        Recently Played
      </button>
      <button 
        transition:fly={{ x: -20, duration: 300, delay: 200 }}
        class="menu-item"
        class:glass={variant === "glass"}
        onclick={() => openPage('request')}
      >
        <Send class="w-4 h-4" />
        Request
      </button>
      {#if $session.data}
        <button 
          transition:fly={{ x: -20, duration: 300, delay: 300 }}
          class="menu-item"
          class:glass={variant === "glass"}
          onclick={() => openPage('admin')}
        >
          <Shield class="w-4 h-4" />
          Admin
        </button>
      {/if}
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
