## Airstream

Color tools for Figma.

### Development

```
git clone https://github.com/caged/airstream.git
yarn
yarn dev
```

#### Adding a new UI view

Plugins with a user interface are built as **views** and and be found in `src/views`.

**`views/MyViewPlugin.svelte`**

```svelte
<script>
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  onMount(() => {
    dispatch('resize', { width: 300, height: 500 })
  })
</script>

<div data-view="MyViewPlugin">Plugin body here</div>
```

**`views/index.js`**

```
export { default as MyViewPlugin } from './MyViewPlugin'
```

**`manifest.json`**

```json
  "menu": [
    { "name": "Run my plugin", "command": "view:MyViewPlugin" }
  ]
```

### Adding a new command

TBD: Plugins without UIs are **commands** and can be found in `src/commands`.

### Testing

```
yarn test
```

### Credits

See [package.json]() for a full list of plugins.

- Built with https://github.com/rollup/rollup
- Built on https://github.com/sveltejs/svelte
- Chromatic color schemes are from https://github.com/d3/d3-scale-chromatic.
- Figma standard UI components and icons are from https://github.com/thomas-lowry/figma-plugin-ds-svelte
