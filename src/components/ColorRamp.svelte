<script>
  import { onMount } from 'svelte'
  import { colorsFromInterpolator } from '../utilities'

  export let interpolator = 'interpolateRainbow'
  export let width = 256
  export let height = 6

  let canvas
  let steps = 256

  onMount(() => {
    const ctx = canvas.getContext('2d')
    const colors = colorsFromInterpolator({ steps, interpolator })
    for (let i = 0; i < steps; ++i) {
      ctx.fillStyle = colors[i].hex
      ctx.fillRect(i, 0, 1, 1)
    }
  })
</script>

<canvas
  bind:this={canvas}
  on:click
  width={256}
  height={1}
  style={`width: ${width}px; height: ${height}px`} />

<style>
  canvas {
    margin: 0;
    padding: 0;
  }
</style>
