import React from 'react'
import { render } from '@testing-library/react'
import ColorRamp from './ColorRamp'

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

// test('sets an interpolator', () => {
//   const interpolator = 'interpolateRainbow'

//   const { container } = render(
//     <ColorRamp width={256} height={1} interpolator={interpolator} />
//   )
//   const canvas = container.querySelector('.palette')

// })
