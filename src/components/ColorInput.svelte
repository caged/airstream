<script>
  export let value = '#cccccc'

  $: figmaValue = value.toUpperCase().replace(/#/, '')
</script>

<div class="input flex justify-content-start">
  <input bind:value type="color" class="color" />
  <input type="text" bind:value={figmaValue} class="text" />
</div>

<style>
  .input {
    border: 1px solid transparent;
    border-radius: 3px;
    line-height: var(--line-height);
  }

  .input:hover {
    border: 1px solid var(--black1);
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

  .color:hover {
    border-color: #e1e1e1;
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
    color: var(--black8);
    border: 1px solid transparent;
    border-radius: var(--border-radius-small);
    outline: none;
    background-color: var(--white);
  }
</style>
