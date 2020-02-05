import React from 'react'
import { render } from '@testing-library/react'
import ColorRamp from './ColorRamp'

// Fix for global type declration in jest-canvas-mock coliding with the default
// CanvasRenderingContext2D
// eslint-disable-next-line no-unused-vars
import { CanvasRenderingContext2D } from '../../node_modules/jest-canvas-mock/lib/classes/CanvasRenderingContext2D'
import { colorsFromInterpolator } from '../utilities'

test('sets size and retains fixed pixel size', () => {
  const width = 500
  const height = 12
  const interpolator = 'interpolateRainbow'
  const { container } = render(
    <ColorRamp width={width} height={height} interpolator={interpolator} />
  )

  const canvas = container.querySelector('.palette')
  expect(canvas).toHaveAttribute('width', '256')
  expect(canvas).toHaveAttribute('height', '1')

  expect(canvas).toHaveStyle({ height: `${height}px`, width: `${width}px` })
})

test('draws canvas with colors from the given interpolator', () => {
  const count = 256
  const interpolator = 'interpolateRainbow'
  const { container } = render(
    <ColorRamp width={count} height={1} interpolator={interpolator} />
  )
  const canvas = container.querySelector('.palette') as HTMLCanvasElement
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const filledColors = ctx
    .__getEvents()
    .filter((d) => d.type === 'fillStyle')
    .map((e) => e.props.value)
  const scaleColors = colorsFromInterpolator(interpolator, count)

  expect(ctx.fillRect).toBeCalledTimes(count)
  expect(filledColors).toStrictEqual(scaleColors)
})
