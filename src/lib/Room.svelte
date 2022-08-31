<script>
    import { room, luminaires } from '../stores/room.js'
</script>

<style lang="scss">
  .lm-room { display: flex; flex-flow: row nowrap; padding: 2rem; border: 1px solid #888;
    .lm-col { display: flex; flex-flow: column nowrap; padding: 0 20px;
      .lm-cell { display: flex; flex-flow: row nowrap; justify-content: center; margin: 1px 0;
        .lm-luminaire { display: inline-block; width: 1em; height: 1.8em;
          transition: background-color ease-in-out 200ms;
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
  {#each $room as cols}
    <div class="lm-col">
      {#each cols as luminaire}
        <div class="lm-cell">
          <div class="lm-luminaire"
               data-name="{luminaire.name}"
               style="background-color: rgba(255, 255, 255, {
                  ($luminaires.get(luminaire.name).level / 100) * 0.8 + 0.2
               })"></div>
        </div>
      {/each}
    </div>
  {/each}
  </div>
{:catch error}
  <div>An error has occured: {error.message}</div>
{/await}
</div>
