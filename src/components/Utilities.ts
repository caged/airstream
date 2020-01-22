import { scaleLinear, scaleSequential } from 'd3-scale'
import { rgb } from 'd3-color'
import * as scales from 'd3-scale-chromatic'

// TODO: https://github.com/typescript-eslint/typescript-eslint/issues/1197
enum FillableTypes {
  ELLIPSE, // eslint-disable-line no-unused-vars
  RECTANGLE, // eslint-disable-line no-unused-vars
  POLYGON, // eslint-disable-line no-unused-vars
}

export const clone = (val) => JSON.parse(JSON.stringify(val))

export const getFirstFill = (shape) => {
  const solids = (shape as GeometryMixin).fills as ReadonlyArray<Paint>
  return solids.find((s) => s.type === 'SOLID') as SolidPaint
}

export const isFillabelShape = (shape): boolean =>
  (FillableTypes[shape.type] as unknown) <= FillableTypes.POLYGON

// export const generateColorSteps = () => {
//   const { selection } = figma.currentPage
//   const fills = []
//   for (const shape of selection) {
//     if (isAllowedShape(shape)) {
//       const fill = getFirstFill(shape)
//       fills.push(fill.color)
//     }
//   }

//   return fills
// }

// const createRect = (width, height, fill) => {
//   const rect = figma.createRectangle()
//   const fills = clone(rect.fills)

//   rect.resize(width, height)
//   fills[0].color = fill
//   rect.fills = fills

//   return rect
// }

export const figmaColorInterpolator = (d3Interpolator) => {
  const interpolator = scales[d3Interpolator]
  return (t) => {
    const c = interpolator(t)
    const { r, g, b } = rgb(c)
    return { r: r / 255, g: g / 255, b: b / 255 }
  }
}

export const hexFromFigmaColor = ({ r, g, b }) =>
  rgb(r * 255, g * 255, b * 255).hex()
