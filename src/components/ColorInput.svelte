<script>
  export let value = '#cccccc'
  let focused = false

  $: figmaValue = value.replace(/#/, '')

  function handleFocus(event) {
    event.target.select()
    focused = true
  }

  function handleBlur(event) {
    focused = false
  }

  function handleKeyDown(event) {
    if (event.keyCode === 13) {
      value = `#${figmaValue}`
    }
  }
</script>

<div class="input flex justify-content-start" class:focused>
  <input bind:value type="color" class="color" />
  <input
    type="text"
    bind:value={figmaValue}
    on:focus={handleFocus}
    on:blur={handleBlur}
    on:keydown={handleKeyDown}
    class="text" />
</div>

<style>
  .input {
    border: 1px solid transparent;
    border-radius: var(--border-radius-small);
    line-height: var(--line-height);
    outline-width: 1px;
    outline-color: transparent;
  }

  .input:not(.focused):hover {
    border: 1px solid var(--black1);
  }

  .focused {
    border: 1px solid var(--blue);
    outline: 1px solid var(--blue);
    outline-offset: -2px;
    /* border-color: var(--blue);
    box-shadow: 0 0 1px 0 var(--blue); */
  }

  .color {
    -webkit-appearance: none;
    outline: none;
    border: none;
    width: 25px;
    height: 25px;
    margin: 0 0 0 2px;
  }

  .color::-webkit-color-swatch {
    border: none;
  }

  .text {
    font-size: var(--font-size-xsmall);
    font-weight: var(--font-weight-normal);
    letter-spacing: var(--font-letter-spacing-neg-xsmall);
    line-height: var(--line-height);
    position: relative;
    overflow: visible;
    align-items: center;
    width: 100%;
    margin: 1px;
    color: var(--black8);
    border: 1px solid transparent;
    border-radius: var(--border-radius-small);
    outline: none;
    background-color: var(--white);
    text-transform: uppercase;
  }
</style>
