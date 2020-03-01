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
  colors: Array<{}>
  size: number
}

figma.showUI(__html__, { visible: false })

if (figma.command) {
  const [part, view] = figma.command.split(':')

  if (part === 'view') {
    figma.ui.postMessage({ view })
  } else {
    exec({ command: view })
  }
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

// Run ui-less commands directly from Figma plugin UI.
function exec({ command }) {
  console.log('executing', command)
}

class AirStreamPlugin {
  static defaults = {
    constrainable: {
      cornerRadius: 3,
      width: 50,
      height: 50,
      offset: {
        x: 10,
        y: 10,
      },
    },
  }

  static resize({ width, height }) {
    figma.ui.resize(width, height)
    figma.ui.show()
  }

  static generateSwatches({
    colors,
    width = this.defaults.constrainable.width,
    height = this.defaults.constrainable.height,
    offsetX = this.defaults.constrainable.offset.x,
    offsetY = this.defaults.constrainable.offset.y,
    cornerRadius = this.defaults.constrainable.cornerRadius,
  }) {
    return colors.map((color, i) => {
      const rect = createRect(width, height, color.figma)
      rect.y = offsetY
      rect.x = i * width + i * offsetX
      rect.cornerRadius = cornerRadius
      rect.name = color.hex
      return rect
    })
  }

  run(action, props) {
    if (AirStreamPlugin[action]) {
      const resource = AirStreamPlugin[action](props)
      if (resource && resource.length) {
        const group = figma.group(resource, figma.currentPage)
        figma.currentPage.selection = resource
        figma.viewport.scrollAndZoomIntoView(resource)
      }
    } else {
      throw new Error(
        `AirStreamPlugin doesnt know how to run action: ${action}`
      )
    }
  }
}

const airstream = new AirStreamPlugin()

figma.ui.onmessage = (message) => {
  const { action, ...props } = message
  airstream.run(action, props)
}
