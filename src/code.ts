figma.showUI(__html__, { visible: false })

if (figma.command) {
  const [part, action] = figma.command.split(':')

  if (part === 'view') {
    figma.ui.postMessage({ view: action })
  } else {
    exec(action)
  }
}

function exec(action) {
  console.log('executing', action)
}

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
