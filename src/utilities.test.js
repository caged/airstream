import { rgb } from 'd3-color'
import { interpolateBlues } from 'd3-scale-chromatic'

import {
  colorsFromInterpolator,
  figmaChromaticInterpolator,
  figmaFromHex
} from './utilities'

const blueHexAtPos = (i) => rgb(interpolateBlues(i)).hex()

test('should generate figma rgb from hex values', () => {
  expect(figmaFromHex('#ffffff')).toEqual({
    r: 1, g: 1, b: 1
  })

  expect(figmaFromHex('#cc0000')).toEqual({
    r: 0.8, g: 0, b: 0
  })

  expect(figmaFromHex('#000000')).toEqual({
    r: 0, g: 0, b: 0
  })
});

test('figmaChromaticInterpolator should generate color for the given interpolator', () => {
  for (const pos of [0, 0.5, 1]) {
    const color = figmaChromaticInterpolator('interpolateBlues')(pos)
    const hval = blueHexAtPos(pos)

    expect(color).toEqual({
      d3: rgb(hval),
      hex: hval,
      figma: figmaFromHex(hval)
    })
  }
})

test('should generate colors for interpolator', () => {
  const colors = colorsFromInterpolator({ steps: 3, interpolator: 'interpolateGreys' })
  expect(colors).toHaveLength(3)
});


test('should generate figma, d3, and hex colors', () => {
  const colors = colorsFromInterpolator({ steps: 2, interpolator: 'interpolateGreys' })
  expect(colors).toHaveLength(2)
  expect(colors).toEqual([
    {
      d3: { b: 255, g: 255, opacity: 1, r: 255 },
      figma: { b: 1, g: 1, r: 1 },
      hex: "#ffffff"
    },
    {
      d3: { b: 151, g: 151, opacity: 1, r: 151 },
      figma: { b: 0.592156862745098, g: 0.592156862745098, r: 0.592156862745098 },
      hex: "#979797"
    }
  ])
});