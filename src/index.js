import PluginApp from './PluginUI.svelte';

let plugin

window.onmessage = (event) => {
	plugin = new PluginApp({
		target: document.body,
		props: { ...event.data.pluginMessage }
	});
}


export default plugin;