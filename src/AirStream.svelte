<script>
  import { GlobalCSS } from 'figma-plugin-ds-svelte'
  import * as views from './views'
  import { runFigmaAction } from './utilities'

  /**
   * Name of view component to render
   * @type {string}
   */
  export let view = 'ChromaticSamples'

  // Internal
  const Component = views[view]

  if (Component === undefined) {
    throw `Unknown plugin view ${view}`
  }

  /**
   * @description Handle resize events sent by views down the chain
   * @param {CustomEvent} event The event passed from a child plugin
   *
   * @example
   *  // In your component
   *  //
   *  import { createEventDispatcher, onMount } from 'svelte'
   *  const dispatch = createEventDispatcher()
   *  onMount(() => {
   *    dispatch('resize', { width: 300, height: 100 })
   *  })
   * @returns void
   */
  function handleResize(event) {
    runFigmaAction({ action: 'resize', ...event.detail })
  }
</script>

<div class="wrapper p-xxsmall">
  <Component on:resize={handleResize} />
</div>

<style>
  /* Add additional global or scoped styles here */
</style>
