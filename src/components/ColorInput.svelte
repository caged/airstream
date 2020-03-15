<script>
  export let value = '#cccccc'
</script>

<div class="input flex justify-content-start">
  <input bind:value type="color" class="color " />
  <input type="text" bind:value class="text" />
</div>

<style>
  .input {
    border: 1px solid transparent;
  }

  .input:hover {
    border: 1px solid var(--black1);
  }

  .color {
    -webkit-appearance: none;
    line-height: var(--line-height);
    border: none;
    width: 27px;
    height: 27px;
    margin: 2px 0 0 2px;
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
    height: 30px;
    margin: 1px 0 1px 0;
    padding: 7px 4px 9px 7px;
    color: var(--black8);
    border: 1px solid transparent;
    border-radius: var(--border-radius-small);
    outline: none;
    background-color: var(--white);
    text-transform: uppercase;
  }
</style>
