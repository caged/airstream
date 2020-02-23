import * as React from 'react'

import SwatchTransition from './SwatchTransition'
import ChromaticPalette from './ChromaticPalette'

// eslint-disable-next-line
declare function require(path: string): any

interface PluginProps {
  command: string
}

export default function Plugin({ command }: PluginProps) {
  return <div id="plugin"></div>
}
