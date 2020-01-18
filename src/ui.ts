import './ui.css';

document.getElementById('create').onclick = () => {
  const textbox = document.getElementById('count') as HTMLInputElement;
  const count = parseInt(textbox.value, 10);
  parent.postMessage({ pluginMessage: { type: 'generate-steps', count } }, '*');
};

document.getElementById('cancel').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
};
