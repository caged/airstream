import React from 'react'
import { render, fireEvent, wait } from '@testing-library/react'
import { useForm, FormContext } from 'react-hook-form'
import FigmaInput from './FigmaInput'

interface Props extends React.ComponentPropsWithoutRef<any> {
  name: string
}

function MyComponent(props: Props) {
  const methods = useForm({})
  return (
    <FormContext {...methods}>
      <FigmaInput {...props} />
    </FormContext>
  )
}

test('renders a figma input', async () => {
  const { getByLabelText, container } = render(<MyComponent name="test" />)
  const wrapper = container.querySelector('.figma-input-container')
  const input = getByLabelText('test')

  expect(wrapper).toBeInTheDocument()
  expect(input).toBeInTheDocument()
})

test('preserves existing classname and adds new ones', async () => {
  const { container } = render(<MyComponent name="test" className="my-class" />)
  const wrapper = container.querySelector('.figma-input-container')
  expect(wrapper).toHaveClass('figma-input-container')
  expect(wrapper).toHaveClass('my-class')
})

test('can set focus state', async () => {
  const { getByLabelText, container } = render(<MyComponent name="test" />)
  const wrapper = container.querySelector('.figma-input-container')
  const input = getByLabelText('test')

  expect(wrapper).not.toHaveClass('focused')

  fireEvent.click(wrapper)
  expect(wrapper).toHaveClass('focused')

  fireEvent.blur(input)
  expect(wrapper).not.toHaveClass('focused')
})
