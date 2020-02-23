import PluginApp from './PluginUI.svelte';

let plugin

window.onmessage = (event) => {
	// parent.postMessage({
	// 	pluginMessage: { foo: 'bar' }
	// }, '*')
	plugin = new PluginApp({
		target: document.body,
		props: { ...event.data.pluginMessage }
	});
}


export default plugin;