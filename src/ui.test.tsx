import React from 'react'
import { render } from '@testing-library/react'
import { App } from './ui'

test('sets size and retains fixed pixel size', () => {
  const { container } = render(<App />)
})
