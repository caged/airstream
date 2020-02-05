import * as React from 'react'
import * as scales from 'd3-scale-chromatic'
import { rgb } from 'd3-color'

export type Interpolator =
  // Cyclical
  | 'interpolateRainbow'
  | 'interpolateSinebow'

  // Diverging
  | 'interpolateSpectral'
  | 'interpolateBrBG'
  | 'interpolatePRGn'
  | 'interpolatePiYG'
  | 'interpolatePuOr'
  | 'interpolateRdBu'
  | 'interpolateRdGy'
  | 'interpolateRdYlBu'
  | 'interpolateRdYlGn'

  // Multi-Hue Sequential
  | 'interpolateTurbo'
  | 'interpolateViridis'
  | 'interpolateWarm'
  | 'interpolateCividis'
  | 'interpolateCool'
  | 'interpolateCubehelixDefault'
  | 'interpolateInferno'
  | 'interpolateMagma'
  | 'interpolatePlasma'
  | 'interpolateBuGn'
  | 'interpolateBuPu'
  | 'interpolateGnBu'
  | 'interpolateOrRd'
  | 'interpolatePuBu'
  | 'interpolatePuBuGn'
  | 'interpolatePuRd'
  | 'interpolateRdPu'
  | 'interpolateYlGn'
  | 'interpolateYlGnBu'
  | 'interpolateYlOrBr'
  | 'interpolateYlOrRd'

  // Single-Hue Sequential
  | 'interpolateBlues'
  | 'interpolatePurples'
  | 'interpolateGreens'
  | 'interpolateGreys'
  | 'interpolateOranges'
  | 'interpolateReds'

interface Props extends React.ComponentPropsWithoutRef<any> {
  interpolator: Interpolator
  width: number
  height: number
}

const ColorRamp = ({ width, height, interpolator, ...props }: Props) => {
  const canvasRef = React.useRef(null)
  const interpolate = scales[interpolator]
  const n = 256
  const colors = []

  props.className = `palette ${props.className}`

  for (let i = 0; i < n; ++i) {
    colors.push(rgb(interpolate(i / (n - 1))).hex())
  }

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    for (let i = 0; i < n; ++i) {
      ctx.fillStyle = colors[i]
      ctx.fillRect(i, 0, 1, 1)
    }
  })

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={1}
      style={{ height: `${height}px`, width: `${width}px` }}
      {...props}
    />
  )
}

export default ColorRamp
