figma.showUI(__html__, { height: 300 })

/**
 * Naive deep clone
 */
const clone = (val) => JSON.parse(JSON.stringify(val))

/**
 * Create a Figma Rect with the given fill.
 * The way figma works, the rect will be created
 * and drawn on screen
 */
const createRect = (
  width: number,
  height: number,
  fill: SolidPaint
): RectangleNode => {
  const rect = figma.createRectangle()
  const fills = clone(rect.fills)

  rect.resize(width, height)
  fills[0].color = fill
  rect.fills = fills

  return rect
}

interface GenerateSwatchesProps {
  colors: Array<any>
  size: number
}

const Actions = {
  /**
   * Generate a group of swatches with the given size and colors
   */
  generateSwatches({ colors, size }: GenerateSwatchesProps): RectangleNode[] {
    return colors.map((color, i) => {
      const rect = createRect(size, size, color.fill)
      rect.x = i * size + (i * size) / 6
      rect.cornerRadius = 3
      rect.name = color.hex
      return rect
    })
  },
}

figma.ui.onmessage = ({ action, ...props }) => {
  if (action === 'generateSwatches') {
    const swatches = Actions.generateSwatches({ size: 50, ...props })
    const group = figma.group(swatches, figma.currentPage)
    group.name = `${props.meta.name} Swatches`
    figma.currentPage.selection = swatches
    figma.viewport.scrollAndZoomIntoView(swatches)
  }
}
