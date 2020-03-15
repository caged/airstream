import { render, fireEvent, wait } from '@testing-library/svelte'
import ChromaticSamples from './ChromaticSamples'
import * as utilities from '../utilities'

beforeEach(() => {
  jest.clearAllMocks()
})

it('should render chromatic samples ui', () => {
  const { container } = render(ChromaticSamples)
  const view = container.querySelector('div[data-view="ChromaticSamples"]')
  expect(view).toBeInTheDocument()
});

test('sets the active color ramp', async () => {
  const { container } = render(ChromaticSamples)

  const el = container.querySelector('.row:nth-child(2)')

  expect(el).toBeInTheDocument()
  expect(el).not.toHaveClass('active')
  expect(el.querySelector('.name')).toHaveTextContent('Sinebow')

  fireEvent.click(el)

  await wait()

  expect(el).toHaveClass('active')
})

test('runs action with the given steps and interpolator', async () => {
  const callback = jest.fn()
  parent.postMessage = callback
  const { container, getByText } = render(ChromaticSamples)

  const btn = getByText('Generate')
  await fireEvent.click(btn)

  const message = callback.mock.calls[0][0].pluginMessage
  expect(callback).toHaveBeenCalledTimes(1)
  expect(message).toMatchObject({ action: 'generateSwatches' })
  expect(message.colors).toHaveLength(9)
})

test('should generate colors with the given number of steps', async () => {
  const callback = jest.fn()
  parent.postMessage = callback
  const { container, getByText } = render(ChromaticSamples)

  const input = container.querySelector('input[name="steps"]')
  const btn = getByText('Generate')

  fireEvent.input(input, { target: { value: 3 } })
  fireEvent.click(btn)

  await wait()

  const message = callback.mock.calls[0][0].pluginMessage
  expect(message.colors).toHaveLength(3)
})