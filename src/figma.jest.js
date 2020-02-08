const JSDOMEnvironment = require('jest-environment-jsdom')
const mock = require('jest-mock')

// Incomplete mock of figma API
const figmaRefs = mock.fn()
figmaRefs.resize = mock.fn()

const figma = mock.fn()
figma.showUI = mock.fn()
figma.ui = mock.fn()
figma.group = mock.fn()

figma.createRectangle = mock.fn(() => {
  return {
    fills: [{ color: mock.fn() }],
    resize: figmaRefs.resize
  }
})


class FigmaEnvironment extends JSDOMEnvironment {
  constructor(config, context) {
    super(config, context)
  }

  async setup() {
    await super.setup()
    this.global.figma = figma
    this.global.figmaRefs = figmaRefs
  }

  async teardown() {
    await super.teardown()
    if (this.global && this.global.figma) {
      delete this.global.figma
      delete this.global.figmaRefs
    }
  }

  runScript(script) {
    return super.runScript(script)
  }
}

module.exports = FigmaEnvironment
