import * as React from 'react'
import { scaleSequential } from 'd3-scale'
import { hsl } from 'd3-color'
import { useForm, FormContext } from 'react-hook-form'
import { figmaChromaticInterpolator } from '../utilities'
import ColorRamp from './ColorRamp'
import FigmaInput from './FigmaInput'

interface Props {}

const interpolators = {
  Cyclical: ['interpolateRainbow', 'interpolateSinebow'],

  Diverging: [
    'interpolateSpectral',
    'interpolateBrBG',
    'interpolatePRGn',
    'interpolatePiYG',
    'interpolatePuOr',
    'interpolateRdBu',
    'interpolateRdGy',
    'interpolateRdYlBu',
    'interpolateRdYlGn',
  ],

  'Multi-Hue Sequential': [
    'interpolateTurbo',
    'interpolateViridis',
    'interpolateWarm',
    'interpolateCividis',
    'interpolateCool',
    'interpolateCubehelixDefault',
    'interpolateInferno',
    'interpolateMagma',
    'interpolatePlasma',
    'interpolateBuGn',
    'interpolateBuPu',
    'interpolateGnBu',
    'interpolateOrRd',
    'interpolatePuBu',
    'interpolatePuBuGn',
    'interpolatePuRd',
    'interpolateRdPu',
    'interpolateYlGn',
    'interpolateYlGnBu',
    'interpolateYlOrBr',
    'interpolateYlOrRd',
  ],

  'Single-Hue Sequential': [
    'interpolateBlues',
    'interpolatePurples',
    'interpolateGreens',
    'interpolateGreys',
    'interpolateOranges',
    'interpolateReds',
  ],
}

const ChromaticPaletteComponent: React.FC<Props> = () => {
  const methods = useForm({})
  const onSubmit = ({ steps, rows, interpolator }) => {
    steps = parseInt(steps)
    rows = parseInt(rows)
    const scale = scaleSequential(
      figmaChromaticInterpolator(interpolator)
    ).domain([0, steps])

    // We could use quantize, but it has two important differences.
    // 1. For continuous scales, it generates idential swatches at the edges
    // 2. Due to the dynamics of 1, I find it produces a harsher transition.
    // const colors = quantize(figmaChromaticInterpolator(interpolator), steps)
    const colors = [...Array(steps).keys()].map(scale)

    const pluginMessage = {
      action: 'generateSwatches',
      colors,
      meta: { name: `${interpolator} colors` },
    }
    parent.postMessage({ pluginMessage }, '*')

    for (let index = 0; index < rows - 1; index++) {
      const colorRow = colors
        .map((color) => {
          const c1 = hsl(color.hex)
          const c2 = c1.brighter((1 / rows) * (index + 1))
          const { r, g, b } = c2.rgb()

          if (r > 255 || g > 255 || b > 255) {
            return { fill: { r: 1, g: 1, b: 1 }, hex: '#ffffff' }
          } else {
            return {
              fill: { r: r / 255, g: g / 255, b: b / 255 },
              hex: c2.hex(),
            }
          }
        })
        .filter((c) => c !== null)

      parent.postMessage(
        {
          pluginMessage: {
            action: 'generateSwatches',
            offsetY: 55 * (index + 1),
            colors: colorRow,
            meta: { name: 'Test' },
          },
        },
        '*'
      )
    }
  }

  return (
    <FormContext {...methods}>
      <div className="plugin-body">
        <div className="flex">
          <h2 className="section-title flex-1">Chromatic Palette</h2>
        </div>
        <p className="info">
          Create a palette by sampling from the chromatic color scheme.
        </p>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="flex">
            <FigmaInput name="steps" type="number" defaultValue={9} />
            <FigmaInput name="rows" type="number" defaultValue={2} />
          </div>
          <div style={{ paddingBottom: '20px' }}>
            {Object.keys(interpolators).map((label) => (
              <div key={label} className="ramp-group">
                <h3>{label}</h3>
                {interpolators[label].map((t) => (
                  <div key={t} className="ramp-row">
                    <input
                      type="hidden"
                      name="interpolator"
                      ref={methods.register}
                      defaultValue="interpolateRainbow"
                    />
                    <ColorRamp
                      interpolator={t}
                      width={310}
                      height={12}
                      onClick={(e) => {
                        document
                          .querySelectorAll('.palette')
                          .forEach((e) => e.classList.remove('focused'))
                        e.currentTarget.classList.add('focused')
                        methods.setValue('interpolator', t, true)
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="form-row primary-actions">
            <input
              type="submit"
              value="Generate Swatches"
              className="btn-primary"
            />
          </div>
        </form>
      </div>
    </FormContext>
  )
}

export default ChromaticPaletteComponent
