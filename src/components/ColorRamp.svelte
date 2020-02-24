<script>
  import { onMount } from 'svelte'
  import { colorsFromInterpolator } from '../utilities'

  let className
  export let interpolator = 'interpolateRainbow'
  export let width = 256
  export let height = 6
  export { className as class }

  let canvas
  let count = 256

  onMount(() => {
    const ctx = canvas.getContext('2d')
    const colors = colorsFromInterpolator(interpolator, count)
    for (let i = 0; i < count; ++i) {
      ctx.fillStyle = colors[i]
      ctx.fillRect(i, 0, 1, 1)
    }
  })
</script>

<canvas
  class={className}
  bind:this={canvas}
  width={256}
  height={1}
  style={`width: ${width}px; height: ${height}px`} />

<style>

</style>
