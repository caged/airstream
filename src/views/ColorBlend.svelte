<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { runFigmaAction, randomHex, colorsFromColors } from '../utilities'
  import ColorInput from '../components/ColorInput'
  import IconButton from '../components/IconButton'

  import {
    Button,
    Input,
    IconAdjust,
    IconPlus,
    IconMinus,
    Label,
    Number,
  } from 'figma-plugin-ds-svelte'

  let steps = 9
  let colors = [randomHex(), randomHex(), randomHex()]
  let rowHeight = 32
  let colorRow
  const dispatch = createEventDispatcher()

  onMount(() => {
    resize()
  })

  function resize() {
    dispatch('resize', { width: 300, height: 110 + rowHeight * colors.length })
  }

  function addColor() {
    if (colors.length < steps) {
      colors = [...colors, randomHex()]
      resize()
    }
  }

  function removeColorAtIndex(index) {
    colors = [...colors.slice(0, index), ...colors.slice(index + 1)]
    resize()
  }

  function runPrimaryAction() {
    const blend = colorsFromColors({
      colors,
      steps,
    })

    runFigmaAction({
      action: 'generateSwatches',
      colors: blend,
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
      <IconButton icon={IconPlus} on:click={addColor} class="add" />
    </div>
  </div>

  <div class="color-inputs">
    {#each colors as color, i}
      <div class="color-input flex" bind:this={colorRow}>
        <div class="flex-1">
          <ColorInput bind:value={color} />
        </div>

        <div class="color-actions">
          <IconButton
            icon={IconMinus}
            on:click={() => removeColorAtIndex(i)}
            class="remove" />
        </div>
      </div>
    {/each}
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
  }

  .color-input {
    margin: 0 0 1px 0;
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
