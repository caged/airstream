import { scaleLinear } from 'd3-scale'
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

export const colorsFromInterpolator = (interpolator, count) => {
  if (count < 1) throw new Error('Must have at least 1 color')

  const colors = []
  const interpolate = chromaticScales[interpolator]
  for (let i = 0; i < count; ++i) {
    colors.push(rgb(interpolate(i / (count - 1))).hex())
  }

export function runFigmaAction({ action, ...props }) {
  parent.postMessage({
    pluginMessage: {
      action,
      ...props
    }
  }, '*')
}