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
  <div class="add-button">
    <IconButton iconName={IconPlus} />
  </div>

  <Label>Steps</Label>
  <Number name="steps" bind:value={steps} iconName={IconAdjust} />
  <div class="color-inputs">
    <ColorInput bind:value={color} />
  </div>
  <div class="actions flex justify-content-end p-xxsmall">
    <Button on:click={runPrimaryAction}>Generate</Button>
  </div>
</div>

<style>
  .color-inputs {
    width: 50%;
  }

  .add-button {
    float: right;
  }
</style>
