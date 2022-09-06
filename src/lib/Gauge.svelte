<script>
    import { init } from 'svelte/internal';
    import { current, max, format} from '../stores/throughput'
</script>

<style lang="scss">
.cmp-gauge { position: relative; display: flex; flex-direction: column; margin: 1rem; text-align: center; padding: 1rem;
    border: 1px solid rgba(255,255,255,0.4); border-radius: 4px;
  .sub-title { font-size: 0.8em; margin-bottom: 0.6em; line-height: 1em; }
  .cont-gauge { position: relative; overflow: hidden;
    &:after { content: ""; display: block; padding-bottom: 50%; }
    .sub-bg-indicator { position: absolute; width: 100%; height: 100%;
        border-radius: 2000px 2000px 0px 0px; background-color: rgba(255,255,255,.2); overflow: hidden;
      .sub-indicator { position: absolute; background-color: #5664F9; width: 100%; height: 100%; top: 100%;
        border-radius: 0px 0px 2000px 2000px; transform-origin: center top; transition: all 0.3s ease-in-out;
      }
    }
    .sub-bg-text { position: absolute; background-color: #2f2f2f; width: 70%; height: 70%; left: 15%;
      bottom: 0rem; border-radius: 2000px 2000px 0px 0px;
    }
    .gauge-data { color: rgba(255,255,255,.8); font-size: 0.7em; line-height: 25px;
        position: absolute; width: 100%; height: 100%; top: 57%; margin-left: auto;
        margin-right: auto; transition: all 0.2s ease-out;
      .data { line-height: 1em; margin: 0;
        &#value { font-size: 2em; }
        &.unit { font-size: 1.2em; }
      }
    }
  }
}
</style>

<div class="cmp-gauge">
  <div class="data sub-title">Request throughput</div>
  <div class="cont-gauge">
    <div class="sub-bg-indicator">
      <div class="sub-indicator" style="transform: rotate({$current / $max * 0.5}turn)"></div>
      <div class="sub-bg-text"></div>
      <div class="gauge-data">
        <div class="data" id="value">{format($current)} / {format($max)}</div>
        <div class="data unit">req/sec</div>
      </div>
    </div>
  </div>
</div>
