<script>
  import { Input, IconAdjust, Label } from 'figma-plugin-ds-svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import { Interpolators } from '../utilities'
  import ColorRamp from '../components/ColorRamp'

  let activeInterpolator = 'interpolateRainbow'
  let steps = 9

  const dispatch = createEventDispatcher()
  const categories = Object.keys(Interpolators)

  onMount(() => {
    dispatch('resize', {
      width: 340,
      height: 400,
    })
  })
</script>

<div data-view="ChromaticSamples">
  <Label>Steps</Label>
  <Input bind:value={steps} iconName={IconAdjust} />
  {#each categories as category}
    <h3 class="mt-xsmall mb-xxsmall">{category}</h3>
    {#each Interpolators[category] as interpolator}
      <div
        class:active={activeInterpolator == interpolator}
        on:click={() => (activeInterpolator = interpolator)}
        class="row">
        <div class="name">{interpolator.replace(/interpolate/, '')}</div>
        <div class="ramp">
          <ColorRamp {interpolator} height={12} />
        </div>
      </div>
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

  .name {
    font-size: var(--font-size-xsmall);
  }

  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 256px;
    gap: 0.25rem;
    border: 1px solid transparent;
    border-radius: var(--border-radius-small);
    padding: 3px;
  }

  .row:hover:not(.active) {
    background-color: var(--grey);
  }

  .active {
    border: 1px solid var(--blue);
    outline: 1px solid var(--blue);
    outline-offset: -2px;
  }
</style>
