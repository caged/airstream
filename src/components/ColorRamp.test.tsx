import React from 'react'
import { render } from '@testing-library/react'
import ColorRamp from './ColorRamp'

test('loads and displays greeting', async () => {
  const { container } = render(
    <ColorRamp width={256} height={12} interpolator="interpolateRainbow" />
  )
})
