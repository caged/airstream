import { scaleLinear } from 'd3-scale'
import { interpolateRgb } from 'd3-interpolate'
import { rgb } from 'd3-color'

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

export const generateColorTransition = ({ steps, colors }) => {
  const domain = colors
    .map((_, i: number) => (i === 0 ? 0 : (steps - 1) / i))
    .sort((a, b) => b - a)

  const scale = scaleLinear()
    .domain(domain)
    .range(colors)
    .interpolate(interpolateFigmaRgb)

  return [...Array(steps).keys()].map(scale)
}
