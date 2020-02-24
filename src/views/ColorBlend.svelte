<script>
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  onMount(() => {
    dispatch('resize', { width: 300, height: 500 })
  })
</script>

<div>Color Blend</div>
