<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { Interpolators } from '../utilities'
  import ColorRamp from '../components/ColorRamp'

  const dispatch = createEventDispatcher()
  const categories = Object.keys(Interpolators)
  onMount(() => {
    dispatch('resize', { width: 280, height: 400 })
  })
</script>

<div>
  {#each categories as category}
    <h3 class="mt-xsmall mb-xxsmall">{category}</h3>
    {#each Interpolators[category] as interpolator}
      <ColorRamp {interpolator} height={12} class="mb-xxsmall" />
    {/each}
  {/each}
</div>

<style>
  h3:first-child {
    margin-top: 0;
  }

  h3 {
    font-size: var(--font-size-xsmall);
    padding: 0;
  }
</style>
