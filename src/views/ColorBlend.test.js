import { render } from '@testing-library/svelte'
import ColorBlend from './ColorBlend'

beforeEach(() => {
  jest.clearAllMocks()
})

it('should render the ColorBlend view', () => {
  const { container } = render(ColorBlend)
  expect(container).toBeInTheDocument()
});