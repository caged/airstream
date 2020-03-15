import { render, fireEvent, wait, act } from '@testing-library/svelte'
import ColorBlend from './ColorBlend'

beforeEach(() => {
  jest.clearAllMocks()
})

it('should render the ColorBlend view', () => {
  const { container } = render(ColorBlend)
  expect(container).toBeInTheDocument()
});

it('sets a few default colors', () => {
  const { container } = render(ColorBlend)
  const colors = container.querySelectorAll('.color-input')
  expect(colors).toHaveLength(3)
});

it('adds a new color', async () => {
  const { container } = render(ColorBlend)
  let colors = container.querySelectorAll('.color-input')
  expect(colors).toHaveLength(3)

  const addBtn = container.querySelector('.add')
  expect(addBtn).toBeInTheDocument()
  await fireEvent.click(addBtn)

  colors = container.querySelectorAll('.color-input')
  expect(colors).toHaveLength(4)
});

it('removes a new color', async () => {
  const { container, component } = render(ColorBlend)
  let colors = container.querySelectorAll('.color-input')
  expect(colors).toHaveLength(3)

  const removeButton = container.querySelector('.color-input .remove')
  expect(removeButton).toBeInTheDocument()

  await fireEvent.click(removeButton)
  colors = container.querySelectorAll('.color-input')
  expect(colors).toHaveLength(2)
});

test('runs action with the given steps and colors', async () => {
  const callback = jest.fn()
  parent.postMessage = callback
  const { getByText } = render(ColorBlend)

  const btn = getByText('Generate')
  await fireEvent.click(btn)

  const message = callback.mock.calls[0][0].pluginMessage
  expect(callback).toHaveBeenCalledTimes(1)
  expect(message).toMatchObject({ action: 'generateSwatches' })
  expect(message.colors).toHaveLength(9)
})