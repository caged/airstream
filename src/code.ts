figma.showUI(__html__, { visible: false })

figma.ui.postMessage({
  command: figma.command,
})

figma.ui.onmessage = (message) => {
  figma.closePlugin()
}
