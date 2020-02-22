import * as React from 'react'
// eslint-disable-next-line no-unused-vars
import { Interpolator, colorsFromInterpolator } from '../utilities'

// Color ramps have a fixed pixel width and heights
const FIXED_WIDTH = 256
const FIXED_HEIGHT = 1

interface Props extends React.ComponentPropsWithoutRef<any> {
  interpolator: Interpolator
  width: number
  height: number
}

const ColorRamp = ({ width, height, interpolator, ...props }: Props) => {
  const canvasRef = React.useRef(null)
  const count = 256
  const colors = colorsFromInterpolator(interpolator, count)

  props.className = `palette ${props.className}`

  React.useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')
    for (let i = 0; i < count; ++i) {
      ctx.fillStyle = colors[i]
      ctx.fillRect(i, 0, 1, 1)
    }
  })

  return (
    <canvas
      ref={canvasRef}
      width={FIXED_WIDTH}
      height={FIXED_HEIGHT}
      style={{ height: `${height}px`, width: `${width}px` }}
      {...props}
    />
  )
}

export default ColorRamp
