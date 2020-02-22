import React from 'react'
import { render, fireEvent, wait } from '@testing-library/react'
import SwatchTransitionComponent from './SwatchTransitionComponent'

it('should render with expected defaults', async () => {
  const { container } = render(<SwatchTransitionComponent />)
  expect(container).toBeInTheDocument()

  expect(container.querySelector('input[name=steps]')).toHaveValue(3)
  expect(container.querySelectorAll('.color-input')).toHaveLength(2)
  expect(container.querySelector('input[name="fill[0].color"]')).toHaveValue(
    '#cccccc'
  )
  expect(container.querySelector('input[name="fill[0].name"]')).toHaveValue(
    'CCCCCC'
  )
})

it('should submit the form', async () => {
  const callback = jest.fn()
  parent.postMessage = callback
  const { getByTitle } = render(<SwatchTransitionComponent />)
  const btn = getByTitle('Submit')
  fireEvent.click(btn)

  await wait()

  expect(callback).toHaveBeenCalledTimes(1)
})

it('should add some colors', async () => {
  const callback = jest.fn()
  parent.postMessage = callback
  const { container } = render(<SwatchTransitionComponent />)
  const btn = container.querySelector('.plus')

  expect(container.querySelectorAll('.color-input')).toHaveLength(2)
  fireEvent.click(btn)
  fireEvent.click(btn)

  await wait()

  expect(container.querySelectorAll('.color-input')).toHaveLength(4)
})

it('should remove some colors when pressing minus button', async () => {
  const callback = jest.fn()
  parent.postMessage = callback
  const { container } = render(<SwatchTransitionComponent />)
  const steps = container.querySelector('input[name=steps]')
  const btn = container.querySelector('.plus')

  fireEvent.change(steps, { target: { value: '10' } })

  fireEvent.click(btn)
  fireEvent.click(btn)

  await wait()

  let wrapper = container.querySelectorAll('.color-input')
  expect(wrapper).toHaveLength(4)

  const minusBtn = container.querySelector('#color-3 .minus')
  expect(minusBtn).toBeInTheDocument()

  fireEvent.click(minusBtn)
  await wait()

  wrapper = container.querySelectorAll('.color-input')
  expect(wrapper).toHaveLength(3)
})

it('should keep color changes in sync between color and text inputs', async () => {
  const callback = jest.fn()
  parent.postMessage = callback
  const { container } = render(<SwatchTransitionComponent />)
  const wrapper = container.querySelector('.color-input')
  const clrInput = wrapper.querySelector('[type="color"]')
  const txtInput = wrapper.querySelector('[type="text"]')

  expect(clrInput).toBeInTheDocument()
  expect(txtInput).toBeInTheDocument()

  expect(clrInput).toHaveValue('#cccccc')
  expect(txtInput).toHaveValue('CCCCCC')

  fireEvent.change(clrInput, { target: { value: '#cc0000' } })

  await wait()

  expect(clrInput).toHaveValue('#cc0000')
  expect(txtInput).toHaveValue('CC0000')

  fireEvent.change(txtInput, { target: { value: 'FF0000' } })

  await wait()

  expect(clrInput).toHaveValue('#ff0000')
  expect(txtInput).toHaveValue('FF0000')
})
