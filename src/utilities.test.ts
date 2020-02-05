import { colorsFromInterpolator } from './utilities'
import {
  interpolateBlues,
  figmaChromaticInterpolator,
} from 'd3-scale-chromatic'
import { rgb } from 'd3-color'

const hex = (i) => rgb(interpolateBlues(i)).hex()

test('generates colors from the given interpolator ', () => {
  const colors = colorsFromInterpolator('interpolateBlues', 3)

  expect(colors).toHaveLength(3)
  expect(colors).toStrictEqual([hex(0), hex(0.5), hex(1)])
})

test('requires at least one color to generate colors for interpoaltor', () => {
  expect(() => colorsFromInterpolator('interpolateBlues', 0)).toThrowError(
    'Must have at least 1 color'
  )
})
