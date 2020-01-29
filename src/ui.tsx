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
          <a onClick={() => setLocation('root')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              style={{ height: '18px', fill: '#777' }}
              className="mr-6"
            >
              <path d="M8 256c0 137 111 248 248 248s248-111 248-248S393 8 256 8 8 119 8 256zm448 0c0 110.5-89.5 200-200 200S56 366.5 56 256 145.5 56 256 56s200 89.5 200 200zm-72-20v40c0 6.6-5.4 12-12 12H256v67c0 10.7-12.9 16-20.5 8.5l-99-99c-4.7-4.7-4.7-12.3 0-17l99-99c7.6-7.6 20.5-2.2 20.5 8.5v67h116c6.6 0 12 5.4 12 12z" />
            </svg>
          </a>
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
