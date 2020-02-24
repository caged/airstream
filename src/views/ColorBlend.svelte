<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { Button, IconButton, IconVisible } from 'figma-plugin-ds-svelte'

  const dispatch = createEventDispatcher()

  onMount(() => {
    dispatch('resize', { width: 300, height: 500 })
  })
</script>

<div>
  Color Blend
  <Button>Hello</Button>
  <IconButton on:click={() => console.log('clicked')} iconName={IconVisible} />
</div>
