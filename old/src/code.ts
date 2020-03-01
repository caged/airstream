import { ColorValues } from './utilities'

figma.showUI(__html__, { height: 400, width: 350 })

type AvailableActions = 'generateSwatches'

interface GenerateSwatchesProps {
  colors: Array<any>
  size?: number
  offsetX?: number
  offsetY?: number
}

interface MetaProps {
  name: string
}

interface MessageProps {
  action: AvailableActions
  meta: MetaProps
  colors: Array<ColorValues>
  size: number
}

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

/**
 * Generate a group of swatches with the given size and colors
 */
const generateSwatches = ({
  colors,
  size = 50,
  offsetY = 0,
}: GenerateSwatchesProps): RectangleNode[] => {
  return colors.map((color, i) => {
    const rect = createRect(size, size, color.fill)
    rect.y = offsetY
    rect.x = i * size + (i * size) / 6
    rect.cornerRadius = 3
    rect.name = color.hex
    return rect
  })
}

const handleMessage = ({ action, ...props }: MessageProps) => {
  if (action === 'generateSwatches') {
    const swatches = generateSwatches(props)
    const group = figma.group(swatches, figma.currentPage)
    group.name = `${props.meta && props.meta.name} Swatches`
    figma.currentPage.selection = swatches
    figma.viewport.scrollAndZoomIntoView(swatches)
  }
}

figma.ui.onmessage = handleMessage

export { generateSwatches, handleMessage }
