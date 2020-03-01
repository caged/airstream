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
import MyViewPlugin from './MyViewPlugin';

export {
  MyViewPlugin
}
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
