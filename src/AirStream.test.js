import { render, fireEvent } from '@testing-library/svelte'
import AirStream from './AirStream'

it('should test something', () => {
  const { container } = render(AirStream, { view: 'ChromaticSamples' })
  expect(1).toBe(1)
});