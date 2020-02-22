import React from 'react'
import { render, fireEvent, act, wait } from '@testing-library/react'
import ChromaticPaletteComponent from './ChromaticPaletteComponent'

beforeEach(() => {})

test('renders the default UI', () => {
  const { queryByLabelText, container } = render(<ChromaticPaletteComponent />)
  const el = container.querySelector("input[name='interpolator']")

  expect(el).toBeInTheDocument()
  expect(el).toHaveValue('interpolateRainbow')
  expect(queryByLabelText('steps')).toHaveValue(9)
})

test('submits form and calls figma', async () => {
  const callback = jest.fn()
  parent.postMessage = callback
  const { getByTitle } = render(<ChromaticPaletteComponent />)

  const btn = getByTitle('Submit')
  fireEvent.click(btn)

  await wait()

  expect(callback).toHaveBeenCalledTimes(1)
  const message = callback.mock.calls[0][0].pluginMessage
  expect(message).toMatchObject({ action: 'generateSwatches' })
  expect(message.colors).toHaveLength(9)
})
