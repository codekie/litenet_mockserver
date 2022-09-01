<script>
  import Room from './lib/Room.svelte'
  import DurationHistogram from './lib/DurationHistogram.svelte';
</script>

<style lang="scss">
  .container { align-items: center; margin-top: -1rem;
    .lm-main { position: relative; width: 80%; align-items: flex-start; }
  }
</style>

<main class="container">
  <div class="lm-main row">
    <Room />
    <DurationHistogram />
  </div>
</main>
