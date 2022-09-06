<script>
    import { room, luminaires } from '../stores/room.js'
</script>

<style lang="scss">
  .lm-room { display: flex; flex-flow: row nowrap; margin: 1rem; padding: 2rem; border: 1px solid #888;
      border-radius: 4px;
    .lm-col { display: flex; flex-flow: column nowrap; padding: 0 20px;
      .lm-cell { display: flex; flex-flow: row nowrap; justify-content: center; margin: 1px 0;
        .lm-luminaire { display: inline-block; width: 0.9rem; height: 1.8rem;
           transition: background-color ease-in-out 200ms;
          .lm-coords { position: relative; display: inline-block; left: 1.3rem; font-size: 0.8em; color: rgba(255,255,255,0.4); }
        }
      }
    }
  }
</style>

<div>
{#await room.init() }
  <div>loading</div>
{:then}
  <div class="lm-room">
  {#each $room as cols, idxCol}
    <div class="lm-col">
      {#each cols as luminaire, idxRow}
        <div class="lm-cell">
          <div class="lm-luminaire"
               title="{luminaire.name}"
               style="background-color: rgba(255, 255, 255, {
                  ($luminaires.get(luminaire.name).level / 129) * 0.8 + 0.2
               })">
            <span class="lm-coords">{idxCol},{idxRow}</span>
          </div>
        </div>
      {/each}
    </div>
  {/each}
  </div>
{:catch error}
  <div>An error has occured: {error.message}</div>
{/await}
</div>
