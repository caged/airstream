import AirStream from './AirStream';

let plugin

window.onmessage = (event) => {
	plugin = new AirStream({
		target: document.body,
		props: { ...event.data.pluginMessage }
	});
}

export default plugin;