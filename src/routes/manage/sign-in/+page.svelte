<script lang="ts">
    import { Input } from "$lib/components/ui/input/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { goto } from "$app/navigation";

    let email = "";
    let password = "";
    let isLoading = false;
    let error = "";

    async function handleSignIn() {
        isLoading = true;
        error = "";

        try {
            const response = await fetch("/api/auth/sign-in/email", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                error = data.message || "Sign in failed";
                isLoading = false;
                return;
            }

            // Redirect to dashboard on successful sign-in
            await goto("/manage/dashboard");
        } catch (err) {
            error = "An error occurred. Please try again.";
            isLoading = false;
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            handleSignIn();
        }
    }
</script>

<div class="centered-box">
  <div class="box-content">
    <h1 class="text-3xl font-bold">Sign In</h1>
    <p class="mt-4 text-white/80">Please sign in with your management account to manage the station.</p>
    
    {#if error}
        <div class="w-full mt-6 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200">
            {error}
        </div>
    {/if}

    <div class="w-full mt-6">
      <Input 
        type="email" 
        placeholder="Email" 
        bind:value={email}
        disabled={isLoading}
        onkeydown={handleKeyDown}
        class="max-w-full" 
      />
      <Input 
        type="password" 
        placeholder="Password" 
        bind:value={password}
        disabled={isLoading}
        onkeydown={handleKeyDown}
        class="max-w-full mt-4" 
      />
      <Button 
        onclick={handleSignIn}
        disabled={isLoading || !email || !password}
        class="mt-4 w-full"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </div>
  </div>
</div>
<style>
  .centered-box {
    width: 100vw;
    height: 90vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    background: transparent;
    z-index: 10;
  }
  .box-content {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #fff;
    box-sizing: border-box;
  }
</style>
