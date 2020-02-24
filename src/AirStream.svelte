<script>
  // import { GlobalCSS } from 'figma-plugin-ds-svelte'
  // import './test.css'
  import * as views from './views'

  // External props
  export let view

  // Internal
  const Component = views[view]

  if (Component === undefined) {
    throw `Unknown plugin view ${view}`
  }

  // Send a command to the Fima plugin code
  //
  // command - name of command
  // props - object of properties to pass along
  //
  // Returns void
  function figmaCommand(command, props) {
    const pluginMessage = { command, ...props }
    parent.postMessage({ pluginMessage }, '*')
  }

  // Handle resize events sent by views down the chain
  //
  // event - CustomEvent
  //
  // In your view:
  //
  // import { createEventDispatcher, onMount } from 'svelte'
  // const dispatch = createEventDispatcher()
  //
  //  onMount(() => {
  //    dispatch('resize', { width: 300, height: 100 })
  //  })
  //
  // Returns nothing
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
