import { scaleLinear } from 'd3-scale'
import { interpolateRgb } from 'd3-interpolate'
import { rgb } from 'd3-color'
import * as chromaticScales from 'd3-scale-chromatic'

const interpolateFigmaRgb = (c1, c2) => {
  return (t) => {
    const rgbstr = interpolateRgb(c1, c2)(t)
    const rgbobj = rgb(rgbstr)
    const { r, g, b } = rgbobj
    return {
      fill: { r: r / 255, g: g / 255, b: b / 255 },
      hex: rgbobj.hex(),
      rgb: rgbobj,
      css: rgbstr,
    }
  }
}

export const figmaChromaticInterpolator = (d3Interpolator) => {
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

export const generateColorTransition = ({ steps, colors }) => {
  const domain = colors
    .map((_, i: number) => (i === 0 ? 0 : (steps - 1) / i))
    .sort((a, b) => a - b)

  const scale = scaleLinear()
    .domain(domain)
    .range(colors)
    .interpolate(interpolateFigmaRgb)

  return [...Array(steps).keys()].map(scale)
}
