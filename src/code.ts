figma.showUI(__html__, { visible: false })

if (figma.command)
  figma.ui.postMessage({
    command: figma.command,
  })

figma.ui.onmessage = (message) => {
  const { command } = message

  if (command === 'resize') {
    const { width, height } = message
    figma.ui.resize(width, height)
    figma.ui.show()
  } else {
    // figma.closePlugin()
  }
}
