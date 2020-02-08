import { scaleLinear } from 'd3-scale'
import { interpolateRgb } from 'd3-interpolate'
import { rgb } from 'd3-color'
import * as chromaticScales from 'd3-scale-chromatic'

export type Interpolator =
  // Cyclical
  | 'interpolateRainbow'
  | 'interpolateSinebow'

  // Diverging
  | 'interpolateSpectral'
  | 'interpolateBrBG'
  | 'interpolatePRGn'
  | 'interpolatePiYG'
  | 'interpolatePuOr'
  | 'interpolateRdBu'
  | 'interpolateRdGy'
  | 'interpolateRdYlBu'
  | 'interpolateRdYlGn'

  // Multi-Hue Sequential
  | 'interpolateTurbo'
  | 'interpolateViridis'
  | 'interpolateWarm'
  | 'interpolateCividis'
  | 'interpolateCool'
  | 'interpolateCubehelixDefault'
  | 'interpolateInferno'
  | 'interpolateMagma'
  | 'interpolatePlasma'
  | 'interpolateBuGn'
  | 'interpolateBuPu'
  | 'interpolateGnBu'
  | 'interpolateOrRd'
  | 'interpolatePuBu'
  | 'interpolatePuBuGn'
  | 'interpolatePuRd'
  | 'interpolateRdPu'
  | 'interpolateYlGn'
  | 'interpolateYlGnBu'
  | 'interpolateYlOrBr'
  | 'interpolateYlOrRd'

  // Single-Hue Sequential
  | 'interpolateBlues'
  | 'interpolatePurples'
  | 'interpolateGreens'
  | 'interpolateGreys'
  | 'interpolateOranges'
  | 'interpolateReds'

const interpolateFigmaRgb = (c1, c2) => {
  return (t) => {
    const rgbstr = interpolateRgb(c1, c2)(t)
    const rgbobj = rgb(rgbstr)
    const { r, g, b } = rgbobj
    return {
      fill: { r: r / 255, g: g / 255, b: b / 255 },
      hex: rgbobj.hex(),
    }
  }
}

export const colorsFromInterpolator = (
  interpolator: Interpolator,
  count: number
): Array<string> => {
  if (count < 1) throw new Error('Must have at least 1 color')

  const colors = []
  const interpolate = chromaticScales[interpolator]
  for (let i = 0; i < count; ++i) {
    colors.push(rgb(interpolate(i / (count - 1))).hex())
  }

  return colors
}

export const figmaChromaticInterpolator = (d3Interpolator: Interpolator) => {
  const interpolator = chromaticScales[d3Interpolator]
  return (t) => {
    const c = interpolator(t)
    const rgbobj = rgb(c)
    const { r, g, b } = rgbobj
    return {
      fill: { r: r / 255, g: g / 255, b: b / 255 },
      hex: rgbobj.hex(),
    }
  }
}

export const generateColorTransition = ({
  steps,
  colors,
}: {
  steps: number
  // d3 type incorrectly specifies number[]
  colors: Array<number | string>
}) => {
  if (colors.length < 2)
    throw new Error('A transition requries at least two colors')

  if (colors.length > steps)
    throw new Error("The number of colors can't be larger than the steps")

  const domain = colors
    .map((_, i: number) => (i === 0 ? 0 : (steps - 1) / i))
    .sort((a, b) => a - b)

  const scale = scaleLinear()
    .domain(domain)
    .range(colors as Array<number>)
    .interpolate(interpolateFigmaRgb)

  return [...Array(steps).keys()].map(scale)
}
