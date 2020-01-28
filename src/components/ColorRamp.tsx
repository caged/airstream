import * as React from 'react'
import * as scales from 'd3-scale-chromatic'
import { rgb } from 'd3-color'

interface Props extends React.ComponentPropsWithoutRef<any> {
  interpolator: string
  width: number
  height: number
}

const ColorRamp = ({ width, height, interpolator, ...props }: Props) => {
  const canvasRef = React.useRef(null)
  const interpolate = scales[interpolator]
  const n = 256
  const colors = []

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
      className="palette"
      ref={canvasRef}
      width={256}
      height={1}
      style={{ height: `${height}px`, width: `${width}px` }}
      {...props}
    />
  )
}

export default ColorRamp
