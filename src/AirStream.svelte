<script>
  import { GlobalCSS } from 'figma-plugin-ds-svelte'
  import * as views from './views'

  /**
   * Name of view component to render
   * @type {string}
   */
  export let view

  // Internal
  const Component = views[view]

  if (Component === undefined) {
    throw `Unknown plugin view ${view}`
  }

  /**
   * @description Send a command to a figma plugin
   *
   * @param {string} command a command name
   * @param {object} props props to pass to figma
   *
   * @returns void
   */
  function figmaCommand(command, props) {
    const pluginMessage = { command, ...props }
    parent.postMessage({ pluginMessage }, '*')
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
    figmaCommand('resize', event.detail)
  }
</script>

<div class="wrapper p-xxsmall">
  <Component on:resize={handleResize} />
</div>

<style>
  /* Add additional global or scoped styles here */
</style>
