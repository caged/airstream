import { scaleLinear, scaleSequential } from 'd3-scale'
import { interpolateRgb } from 'd3-interpolate'
import { rgb } from 'd3-color'
import * as chromaticScales from 'd3-scale-chromatic'

/**
 * Chromatic interpolators supported by d3-scale-chromatic
 */

export const Interpolators = {
  Cyclical: [
    'interpolateRainbow',
    'interpolateSinebow'
  ],

  Diverging: [
    'interpolateSpectral',
    'interpolateBrBG',
    'interpolatePRGn',
    'interpolatePiYG',
    'interpolatePuOr',
    'interpolateRdBu',
    'interpolateRdGy',
    'interpolateRdYlBu',
    'interpolateRdYlGn',
  ],

  'Multi-Hue Sequential': [
    'interpolateTurbo',
    'interpolateViridis',
    'interpolateWarm',
    'interpolateCividis',
    'interpolateCool',
    'interpolateCubehelixDefault',
    'interpolateInferno',
    'interpolateMagma',
    'interpolatePlasma',
    'interpolateBuGn',
    'interpolateBuPu',
    'interpolateGnBu',
    'interpolateOrRd',
    'interpolatePuBu',
    'interpolatePuBuGn',
    'interpolatePuRd',
    'interpolateRdPu',
    'interpolateYlGn',
    'interpolateYlGnBu',
    'interpolateYlOrBr',
    'interpolateYlOrRd',
  ],

  'Single-Hue Sequential': [
    'interpolateBlues',
    'interpolatePurples',
    'interpolateGreens',
    'interpolateGreys',
    'interpolateOranges',
    'interpolateReds',
  ],
}

export const figmaFromHex = (hex) => {
  const rgbobj = rgb(hex)
  const { r, g, b } = rgbobj
  return { r: r / 255, g: g / 255, b: b / 255 }
}

export const colorsFromInterpolator = ({ steps, interpolator }) => {
  if (steps < 1) throw new Error('Must have at least 1 color')
  const scale = scaleSequential(figmaChromaticInterpolator(interpolator))
    .domain([0, steps])

  return [...Array(steps).keys()].map(scale)
}

export const figmaChromaticInterpolator = (d3Interpolator) => {
  const interpolator = chromaticScales[d3Interpolator]
  return (t) => {
    const c = interpolator(t)
    const color = rgb(c)
    const hex = color.hex()
    return {
      figma: figmaFromHex(hex),
      d3: color,
      hex,
    }
  }
}

export function runFigmaAction({ action, ...props }) {
  parent.postMessage({
    pluginMessage: {
      action,
      ...props
    }
  }, '*')
}