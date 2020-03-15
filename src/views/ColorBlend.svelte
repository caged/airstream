<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import ColorInput from '../components/ColorInput'
  import {
    Button,
    Input,
    IconAdjust,
    IconPlus,
    IconButton,
    Label,
    Number,
  } from 'figma-plugin-ds-svelte'

  let steps = 9
  let color
  const dispatch = createEventDispatcher()

  onMount(() => {
    dispatch('resize', { width: 300, height: 300 })
  })

  function runPrimaryAction() {
    // const colors = colorsFromInterpolator({
    //   interpolator: activeInterpolator,
    //   steps,
    // })
    runFigmaAction({
      action: 'generateSwatches',
      colors: [],
    })
  }
</script>

<div data-view="ColorBlend">
  <div class="adjustments flex">
    <div class="flex-1">
      <span class="label">Steps</span>
      <div class="inline">
        <Number name="steps" bind:value={steps} />
      </div>
    </div>
    <div class="align-self-end">
      <IconButton iconName={IconPlus} />
    </div>
  </div>

  <div class="color-inputs">
    <ColorInput bind:value={color} />
  </div>

  <div class="actions flex justify-content-end p-xxsmall">
    <Button on:click={runPrimaryAction}>Generate</Button>
  </div>
</div>

<style>
  .label {
    font-size: var(--font-size-xsmall);
    color: var(--black3);
    user-select: none;
  }

  .flex-1 {
    flex: 1 1 0%;
  }

  .inline {
    display: inline-block;
  }

  .color-inputs {
    margin-top: var(--size-xxsmall);
    width: 50%;
  }
</style>
