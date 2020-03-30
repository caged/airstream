<script>
  let className = ''
  export let icon
  export { className as class }

  let btn

  function blur() {
    // btn.blur()
  }
</script>

<button on:click on:click={blur} bind:this={btn} class={className}>
  {@html icon}
</button>

<style>
  button {
    appearance: none;
    background: transparent;
    width: var(--size-medium);
    height: var(--size-medium);
    border-radius: var(--border-radius-small);
    border: none;
    padding: 0;
    margin: 0;
    line-height: 0;
    outline: none;
  }

  button:hover {
    background: var(--hover-fill);
  }
</style>
