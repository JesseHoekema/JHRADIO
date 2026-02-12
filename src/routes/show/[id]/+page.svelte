<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import MenuButton from "$lib/components/MenuButton.svelte";

  type Show = {
    id: number;
    name: string;
    description: string | null;
  };

  const props = $props<{ data: { show: Show } }>();
  const data = $derived(props.data);
</script>

<div class="fixed top-5 left-5 z-20">
  <MenuButton />
</div>

<div class="main">
  <div class="centered-box">
    <div class="box-content">
      <h1 class="text-3xl font-bold">{data.show.name}</h1>
      <p class="mt-3 text-white/80">
        {data.show.description ?? "No description yet."}
      </p>
      <div class="mt-6">
        <Button href={`/schedule?highlight=${data.show.id}`} variant="outline">
          Show In Schedule
        </Button>
        {#if data.isAdmin}
          <Button
            href={`/manage/dashboard/shows?edit=${data.show.id}`}
            variant="outline"
            class="ml-2"
          >
            Edit Show
          </Button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .main {
    position: fixed;
    inset: 0;
    z-index: 10;
    background: transparent;
    display: flex;
    flex-direction: column;
  }
  .centered-box {
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    position: relative;
    min-height: 100vh;
    background: transparent;
    z-index: 10;
  }
  .box-content {
    margin-top: 48px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #fff;
    width: 800px;
    box-sizing: border-box;
  }
</style>
