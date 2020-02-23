<script>
  export let command
  import { onMount } from 'svelte'

  //import Global CSS from the svelte boilerplate
  //contains Figma color vars, spacing vars, utility classes and more
  import { GlobalCSS } from 'figma-plugin-ds-svelte'

  onMount(() => {
    parent.postMessage(
      {
        pluginMessage: {
          command: 'resize',
          width: 300,
          height: 300,
        },
      },
      '*'
    )
  })
</script>

<div class="wrapper p-xxsmall">
  {#if command === 'ui:swatch-blend'}
    swatch blend
  {:else if command === 'ui:chromatic-stack'}chromatic stack{/if}

</div>

<style>
  /* Add additional global or scoped styles here */
</style>
