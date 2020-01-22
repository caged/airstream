import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'

import SwatchTransitionComponent from './components/SwatchTransitionComponent'

// eslint-disable-next-line
declare function require(path: string): any

function App() {
  return (
    <div>
      <SwatchTransitionComponent />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
