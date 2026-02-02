<script lang="ts">
    import { authClient } from "$lib/auth-client";
    import AppSidebar from "$lib/components/Sidebar.svelte";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
</script>

<Sidebar.Provider>
  <AppSidebar />
  <main class="z-10">
    <Sidebar.Trigger />
  </main>
</Sidebar.Provider>