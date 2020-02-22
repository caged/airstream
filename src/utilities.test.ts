import {
  generateColorTransition,
  colorsFromInterpolator,
  figmaChromaticInterpolator,
} from './utilities'
import { scaleSequential } from 'd3-scale'
import { interpolateBlues } from 'd3-scale-chromatic'
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

test('figmaChromaticInterpolator should generate figma rgb fills for the given interpolator', () => {
  for (const pos of [0, 0.5, 1]) {
    const color = figmaChromaticInterpolator('interpolateBlues')(pos)
    const hval = hex(pos)
    const { r, g, b } = rgb(hval)

    expect(color).toStrictEqual({
      hex: hex(pos),
      fill: { r: r / 255, g: g / 255, b: b / 255 },
    })
  }
})

test('generates figma fills from interpolator', () => {
  const scale = scaleSequential(
    figmaChromaticInterpolator('interpolateBlues')
  ).domain([0, 3])

  let { r, g, b } = rgb(hex(0))
  r /= 255
  g /= 255
  b /= 255

  expect(scale(0)).toStrictEqual({ hex: hex(0), fill: { r, g, b } })
})

test('generates a color transition from a given set of colors', () => {
  const colors = generateColorTransition({ steps: 3, colors: ['#fff', '#ccc'] })
  expect(colors).toHaveLength(3)
  expect(colors).toStrictEqual([
    { fill: { r: 1, g: 1, b: 1 }, hex: '#ffffff' },
    {
      fill: {
        r: 0.9019607843137255,
        g: 0.9019607843137255,
        b: 0.9019607843137255,
      },
      hex: '#e6e6e6',
    },
    { fill: { r: 0.8, g: 0.8, b: 0.8 }, hex: '#cccccc' },
  ])
})

test('requires at least two colors to generate a transition', () => {
  const colors = ['#fff', '#ccc']
  expect(() => generateColorTransition({ steps: 1, colors })).toThrow()
  expect(generateColorTransition({ steps: 2, colors })).toHaveLength(2)
})

test('requires steps greater or equal to number of colors', () => {
  const colors = ['#fff', '#ccc', '#000']

  expect(() => generateColorTransition({ steps: 2, colors })).toThrow()
  expect(generateColorTransition({ steps: 3, colors })).toHaveLength(3)
})
