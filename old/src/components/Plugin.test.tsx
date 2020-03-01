import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Plugin from './Plugin'

test('renders plugin menu', () => {
  const { container } = render(<Plugin />)
  const menu = container.querySelector('#menu')
  expect(menu).toBeTruthy()
})

test('navigates to color blend ui', () => {
  const { container, getByText } = render(<Plugin />)
  const btn = getByText('Color Blend')
  expect(btn).toBeTruthy()

  fireEvent.click(btn)

  expect(container.querySelector('.plugin-body')).toBeTruthy()
  expect(container.querySelector('.section-title')).toHaveTextContent(
    'Color Blend'
  )
})

test('navigates to chromatic palette ui', () => {
  const { container, getByText } = render(<Plugin />)
  const btn = getByText('Chromatic Palette')
  expect(btn).toBeTruthy()

  fireEvent.click(btn)

  expect(container.querySelector('.plugin-body')).toBeTruthy()
  expect(container.querySelector('.section-title')).toHaveTextContent(
    'Chromatic Palette'
  )
})

test('navigates back to root menu', () => {
  const { container, getByText } = render(<Plugin />)
  const btn = getByText('Chromatic Palette')
  expect(btn).toBeTruthy()

  fireEvent.click(btn)

  const btnRoot = container.querySelector('.ui-actions a')
  expect(btnRoot).toBeTruthy()

  fireEvent.click(btnRoot)
  expect(container.querySelector('.plugin-body')).toBeFalsy()
  expect(container.querySelector('#menu')).toBeTruthy()
})
