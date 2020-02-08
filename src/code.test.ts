/**
 * @jest-environment /Users/justin/dev/figma/plugins/airstream/src/figma.jest.js
 */

import { Actions } from './code'
import { generateColorTransition } from './utilities'
import '../figma.d.ts'

// Declaring globals in our custom environment doesn't
// seem to fully satisfy the type checker.
declare global {
  interface Window {
    figma: () => void
    figmaRefs: any
  }
}

beforeEach(() => {
  jest.resetAllMocks()
})

test('generates swatches', () => {
  const size = 50
  const colors = generateColorTransition({ steps: 2, colors: ['#fff', '#ccc'] })
  Actions.generateSwatches({ colors, size })

  expect(figma.showUI).toHaveBeenCalledTimes(1)
  expect(figma.createRectangle).toHaveBeenCalledTimes(2)
  expect(window.figmaRefs.resize).toHaveBeenCalledWith(size, size)
})
