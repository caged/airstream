<script>
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  onMount(() => {
    dispatch('resize', { width: 300, height: 100 })
  })
</script>

<div>Chromatic Samples</div>
