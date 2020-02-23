/* istanbul ignore file */
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Plugin from './components/Plugin'
import './ui.css'

// eslint-disable-next-line
declare function require(path: string): any

window.onmessage = (event) => {
  const { pluginMessage: props } = event.data
  ReactDOM.render(<Plugin {...props} />, document.getElementById('app'))
}
