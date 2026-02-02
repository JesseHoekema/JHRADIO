<script lang="ts">
  export let data;
</script>

<div class="main">
    <div class="centered-box">
      <div class="box-content">
    <h1 class="text-3xl font-bold">Show ID: {data.id}</h1>
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
