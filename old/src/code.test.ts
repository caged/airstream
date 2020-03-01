/**
 * @jest-environment ./src/figma.jest.js
 */

import { generateSwatches, handleMessage } from './code'
import { generateColorTransition } from './utilities'
import '../figma.d.ts'

// Declaring globals in our custom environment doesn't
// seem to fully satisfy the type checker.
declare global {
  interface Window {
    figma: any
    figmaRefs: any
  }
}

beforeEach(() => {
  jest.resetAllMocks()
})

test('generates swatches', () => {
  const size = 50
  const colors = generateColorTransition({ steps: 2, colors: ['#fff', '#ccc'] })
  generateSwatches({ colors, size })

  expect(figma.createRectangle).toHaveBeenCalledTimes(2)
  expect(window.figmaRefs.resize).toHaveBeenCalledWith(size, size)
})

test('can handle message', () => {
  const colors = generateColorTransition({ steps: 2, colors: ['#fff', '#ccc'] })

  expect(
    handleMessage({
      action: 'generateSwatches',
      size: 50,
      colors,
      meta: { name: 'foo' },
    })
  )
})
