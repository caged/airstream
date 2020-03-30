import { render, fireEvent } from '@testing-library/svelte'
import AirStream from './AirStream'

it('should render plugin with a default view', () => {
  const { container } = render(AirStream)
  const view = container.querySelector('div[data-view="ChromaticSamples"]')
  expect(view).toBeInTheDocument()
});

it('should render plugin with the given view', () => {
  const { container } = render(AirStream, { view: 'ChromaticSamples' })
  const view = container.querySelector('div[data-view="ChromaticSamples"]')
  expect(view).toBeInTheDocument()
});

it('should throw an error if the view doesnt exist', () => {
  expect(() => {
    render(AirStream, { view: 'DoesNotExist' })
  }).toThrow()
});