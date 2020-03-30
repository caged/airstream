import { render, fireEvent } from '@testing-library/svelte'
import ColorInput from './ColorInput'

it('should render a color input', () => {
  const { container } = render(ColorInput)
  expect(container).toBeInTheDocument()
});

it('should set the input color', async () => {
  const { container } = render(ColorInput)

  const input = container.querySelector('.color')
  await fireEvent.input(input, { target: { value: '#cc0000' } })

  expect(input).toHaveAttribute('type', 'color')
  expect(input).toHaveValue('#cc0000')
});

it('should set sync color and text inputs', async () => {
  const { container } = render(ColorInput)
  const color = container.querySelector('.color')
  const text = container.querySelector('.text')

  await fireEvent.input(color, { target: { value: '#cc0000' } })

  expect(color).toHaveValue('#cc0000')
  expect(text).toHaveValue('cc0000')

  await fireEvent.input(text, { target: { value: '00cc00' } })
  await fireEvent.blur(text)

  expect(color).toHaveValue('#00cc00')
  expect(text).toHaveValue('00cc00')
});

it('should set color when pressing enter on text', async () => {
  const { container } = render(ColorInput)
  const color = container.querySelector('.color')
  const text = container.querySelector('.text')

  await fireEvent.input(text, { target: { value: '00cc00' } })
  await fireEvent.keyDown(text, { keyCode: 13 })

  expect(color).toHaveValue('#00cc00')
  expect(text).toHaveValue('00cc00')

  await fireEvent.input(text, { target: { value: 'FF00FF' } })
  await fireEvent.keyDown(text, { keyCode: 10 })

  expect(color).not.toHaveValue('#FF00FF')
  expect(text).toHaveValue('FF00FF')
});

it('should focus the element when focusing the input', async () => {
  const { container } = render(ColorInput)
  const input = container.querySelector('.input')
  const text = container.querySelector('.text')

  expect(input).not.toHaveClass('focused')

  await fireEvent.focus(text)

  expect(input).toHaveClass('focused')
});