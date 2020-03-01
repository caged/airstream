import { render } from '@testing-library/svelte'

import ColorRamp from './ColorRamp'
import { colorsFromInterpolator } from '../utilities'

test('sets size and retains fixed pixel size', () => {
  const width = 500
  const height = 12
  const interpolator = 'interpolateRainbow'
  const { container } = render(ColorRamp, { width, height, interpolator })

  const canvas = container.querySelector('canvas')
  expect(canvas).toHaveAttribute('width', '256')
  expect(canvas).toHaveAttribute('height', '1')

  expect(canvas).toHaveStyle({ height: `${height}px`, width: `${width}px` })
})

test('draws canvas with colors from the given interpolator', () => {
  const steps = 256
  const interpolator = 'interpolateRainbow'
  const { container } = render(ColorRamp, { interpolator })

  const canvas = container.querySelector('canvas')
  const ctx = canvas.getContext('2d')
  const filledColors = ctx
    .__getEvents()
    .filter((d) => d.type === 'fillStyle')
    .map((e) => e.props.value)
  const scaleColors = colorsFromInterpolator({ steps, interpolator }).map(c => c.hex)

  expect(ctx.fillRect).toBeCalledTimes(steps)
  expect(filledColors).toStrictEqual(scaleColors)
})