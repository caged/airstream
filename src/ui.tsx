import * as React from 'react'
import * as ReactDOM from 'react-dom'
import './ui.css'

import SwatchTransitionComponent from './components/SwatchTransitionComponent'
import ChromaticPaletteComponent from './components/ChromaticPaletteComponent'

// eslint-disable-next-line
declare function require(path: string): any

function App() {
  const [location, setLocation] = React.useState('root')

  return (
    <div className="ui">
      {location !== 'root' && (
        <div className="ui-actions">
          <a onClick={() => setLocation('root')}>&#xab; Tools</a>
        </div>
      )}
      {location === 'root' && (
        <div id="menu">
          <ul className="tools">
            <li>
              <a onClick={() => setLocation('swatchTransition')}>
                Swatch Transition Palette
              </a>
            </li>
            <li>
              <a onClick={() => setLocation('chromaticScheme')}>
                Chromatic Scheme Palette
              </a>
            </li>
          </ul>
        </div>
      )}
      <div className="content">
        {location === 'swatchTransition' && <SwatchTransitionComponent />}
        {location === 'chromaticScheme' && <ChromaticPaletteComponent />}
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('app'))
