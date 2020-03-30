import { render, fireEvent } from '@testing-library/svelte'
import IconButton from './IconButton'
import { IconPlus } from 'figma-plugin-ds-svelte'

it('should render an icon button with defaults', () => {
  const { container } = render(IconButton, { icon: IconPlus })
  expect(container).toContainHTML('button')
});

it('should render an icon button with the given icon', () => {
  const { container } = render(IconButton, { icon: IconPlus })
  const icon = container.querySelector('svg')
  const path = icon.querySelector('path')

  expect(icon).toBeInTheDocument()
  expect(path).toHaveAttribute('d', 'm15.5 15.5v-5h1v5h5v1h-5v5h-1v-5h-5v-1z')
});

it('should render a button with a given class', () => {
  const { container } = render(IconButton, { icon: IconPlus, class: 'my-class' })
  const btn = container.querySelector('button')
  expect(btn).toHaveClass('my-class')
});

it('should call on:click callback', async () => {
  const callback = jest.fn()
  const { container, component } = render(IconButton, { icon: IconPlus, class: 'my-class' })

  component.$on('click', callback)
  const btn = container.querySelector('button')

  await fireEvent.click(btn)
  expect(callback).toHaveBeenCalledTimes(1)

});