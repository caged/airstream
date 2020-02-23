<style>
  /* Add additional global or scoped styles here */
</style>

<script>
  import { onMount } from 'svelte'

  //import Global CSS from the svelte boilerplate
  //contains Figma color vars, spacing vars, utility classes and more
  import { GlobalCSS } from 'figma-plugin-ds-svelte'

  onMount(() => {
    parent.postMessage(
      {
        pluginMessage: {
          command: 'resize',
          width: 200,
          height: 300,
        },
      },
      '*'
    )
  })
</script>

<div class="wrapper p-xxsmall">hello world</div>
