figma.showUI(__html__, { width: 200, height: 200, visible: false })

if (figma.command)
  figma.ui.postMessage({
    command: figma.command,
  })

figma.ui.onmessage = (message) => {
  const { command } = message

  if (command === 'resize') {
    figma.ui.resize(message.width, message.height)
    figma.ui.show()
  } else {
    // figma.closePlugin()
  }
}
