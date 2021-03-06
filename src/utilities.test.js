import { rgb } from 'd3-color'
import { interpolateBlues } from 'd3-scale-chromatic'

import {
  colorsFromInterpolator,
  figmaChromaticInterpolator,
  figmaFromHex,
  randomHex,
  colorsFromColors,
  colorSpread
} from './utilities'
import { text } from 'svelte/internal';

const blueHexAtPos = (i) => rgb(interpolateBlues(i)).hex()

it('should generate figma rgb from hex values', () => {
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

it('figmaChromaticInterpolator should generate color for the given interpolator', () => {
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

it('should generate colors for interpolator', () => {
  const colors = colorsFromInterpolator({ steps: 3, interpolator: 'interpolateGreys' })
  expect(colors).toHaveLength(3)
});


it('should generate figma, d3, and hex colors', () => {
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

it('should generate swatches between colors', () => {
  const colors = colorsFromColors({ steps: 3, colors: ['#fff', '#ccc'] })
  const hexes = colors.map(c => c.hex)

  expect(hexes).toHaveLength(3)
  expect(hexes).toEqual(['#ffffff', '#e6e6e6', '#cccccc'])
});

it('should generate a random hex', () => {
  const hex = randomHex()
  // Regex from https://stackoverflow.com/a/1636354/26876
  expect(hex).toMatch(/^#(?:[0-9a-fA-F]{3}){1,2}$/)
});

it('should generate figma, d3, and hex colors from a rgb string', () => {
  const { d3, figma, hex } = colorSpread('rgb(255, 255, 255)')

  expect(d3).toEqual({ r: 255, g: 255, b: 255, opacity: 1 })
  expect(figma).toEqual({ r: 1, g: 1, b: 1 })
  expect(hex).toEqual('#ffffff')
});