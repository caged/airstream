import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './ui.css';

import SwatchTransitionComponent from './SwatchTransitionComponent'

// eslint-disable-next-line
declare function require(path: string): any

// import './ui.css';

// document.getElementById('create-fill-blend').onclick = () => {
//   const textbox = document.getElementById('count') as HTMLInputElement;
//   const count = parseInt(textbox.value, 10);

//   parent.postMessage({ pluginMessage: { type: 'generate-fill-blend', count } }, '*');
// };

// document.getElementById('create-palette-steps').onclick = () => {
//   const textbox = document.getElementById('palette-step-count') as HTMLInputElement;
//   const select = document.getElementById('interpolator') as HTMLInputElement;
//   const steps = parseInt(textbox.value, 10);
//   const interpolator = select.value;

//   parent.postMessage({ pluginMessage: { type: 'generate-palette-steps', steps, interpolator } }, '*');
// };

// document.getElementById('cancel').onclick = () => {
//   parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
// };


function App() {
  return (<div>
    <SwatchTransitionComponent />
  </div>);
}

ReactDOM.render(<App />, document.getElementById('app'));
