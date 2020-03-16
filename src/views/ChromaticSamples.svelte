<script>
  import {
    Button,
    Input,
    IconAdjust,
    Label,
    Number,
  } from 'figma-plugin-ds-svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import {
    Interpolators,
    colorsFromInterpolator,
    runFigmaAction,
  } from '../utilities'
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

  function runPrimaryAction() {
    const colors = colorsFromInterpolator({
      interpolator: activeInterpolator,
      steps,
    })
    runFigmaAction({
      action: 'generateSwatches',
      colors,
    })
  }
</script>

<div data-view="ChromaticSamples">
  <div class="mb-xxsmall">
    <Label>Steps</Label>
    <Number name="steps" bind:value={steps} iconName={IconAdjust} />
  </div>
  <div class="categories">
    {#each categories as category}
      <h3 class="mt-xsmall mb-xxsmall">{category}</h3>
      <div class="ramps">
        {#each Interpolators[category] as interpolator}
          <div
            class="row"
            class:active={activeInterpolator == interpolator}
            on:click={() => (activeInterpolator = interpolator)}>
            <div class="name">{interpolator.replace(/interpolate/, '')}</div>
            <div class="ramp">
              <ColorRamp {interpolator} height={12} />
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </div>
  <div class="actions flex justify-content-end p-xxsmall">
    <Button on:click={runPrimaryAction}>Generate</Button>
  </div>
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
    overflow-x: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }

  .categories {
    margin-bottom: 45px;
  }

  .row {
    line-height: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 256px;
    gap: 0.25rem;
    border: 1px solid transparent;
    border-radius: var(--border-radius-small);
    padding: 4px;
  }

  .row:hover:not(.active) {
    background-color: var(--grey);
  }

  .active {
    border: 1px solid var(--blue);
    outline: 1px solid var(--blue);
    outline-offset: -2px;
  }

  .actions {
    background: var(--white);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
  }
</style>
