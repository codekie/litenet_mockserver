<script>
    import { init } from 'svelte/internal';
import {histogram, max, avg, initHistogram} from '../stores/duration-histogram'

$: avgPercent = $max ? $avg / $max * 100 : 0;
</script>

<style lang="scss">
  .lm-duration-histogram { position: relative; display: flex; flex-direction: column; margin: 1rem; padding: 1rem 1.5rem;
      border: 1px solid rgba(255,255,255,0.4); border-radius: 4px;
    .lm-title { line-height: 1em; margin-bottom: 0.2em; font-size: 0.8em; }
    .lm-cont-histogram { display: flex; flex-direction: row nowrap; align-items: stretch;
      .lm-numbers { position: relative; display: flex; flex-direction: column; justify-content: space-between;
          font-size: 0.6em; line-height: 1em;
        &.left-aligned { align-items: flex-start; padding-left: 0.3rem; }
        &.right-aligned { align-items: flex-end; padding-right: 0.3rem; }
        .value { position: absolute; }
        .lm-max { top: 0; }
        .lm-avg { position: absolute; margin-bottom: -0.5em; transition: bottom ease-in-out 300ms; }
        .lm-zero { bottom: 0; }
      }
      .lm-histogram { position: relative; display: flex; flex-direction: row; align-items: flex-end; width: 14rem; height: 6rem;
          overflow: hidden;
        .lm-entry { position: relative; display: inline-block; width: 2.1%; background-color: rgba(169, 253, 169, 0.8); }
        .lm-marker-avg { position: absolute; width: 100%; background-color: rgba(255, 255, 255, 0.2); border-width: 0 0 1px 0;
          transition: height ease-in-out 300ms;
        }
      }
    }
  }
</style>

<div class="lm-duration-histogram">
{#await initHistogram() }
  <div>initializing...</div>
{:then}
  <div class="lm-title">Duration between requests (in ms)</div>
  <div class="lm-cont-histogram">
    <div class="lm-numbers right-aligned">
      <span class="lm-max value">{ $max ? $max : '' }</span>
      <span class="lm-zero value">0</span>
    </div>
    <div class="lm-histogram">
  {#each $histogram as duration}
      <div class="lm-entry" style="height: { $max ? duration / $max * 100 : 0 }%;"></div>
  {/each}
      <div class="lm-marker-avg" style="height: { avgPercent }%"></div>
    </div>
    <div class="lm-numbers left-aligned">
      <span class="lm-avg value" style="bottom: { avgPercent }%">{ $avg ? $avg : '' }</span>
    </div>
  </div>
{:catch error}
  <div>An error has occured: {error.message}</div>
{/await}
</div>
