import React from 'react'
import { render, fireEvent, wait } from '@testing-library/react'
import ChromaticPaletteComponent from './ChromaticPaletteComponent'

test('renders the default UI', () => {
  const { queryByLabelText, container } = render(<ChromaticPaletteComponent />)
  const el = container.querySelector("input[name='interpolator']")

  expect(el).toBeInTheDocument()
  expect(el).toHaveValue('interpolateRainbow')
  expect(queryByLabelText('steps')).toHaveValue(9)
})

test('sets the active color ramp', () => {
  const { container } = render(<ChromaticPaletteComponent />)
  const el = container.querySelector('.ramp-row:nth-child(2) canvas')

  expect(el).toBeInTheDocument()
  expect(el).not.toHaveClass('focused')

  fireEvent.click(el)

  expect(el).toHaveClass('focused')
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
