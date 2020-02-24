<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { Interpolators } from '../utilities'

  const dispatch = createEventDispatcher()
  onMount(() => {
    dispatch('resize', { width: 300, height: 100 })
  })
</script>

<div class="foo">Chromatic Samples</div>

<style>

</style>
