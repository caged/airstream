import * as React from 'react'
import { scaleSequential } from 'd3-scale'
import { useForm, FormContext } from 'react-hook-form'
import { figmaChromaticInterpolator } from '../utilities'
import ColorRamp from './ColorRamp'
import FigmaInput from './FigmaInput'

interface Props {}

const interpolators = [
  // Cyclical
  'interpolateRainbow',
  'interpolateSinebow',

  // Diverging
  'interpolateSpectral',
  'interpolateBrBG',
  'interpolatePRGn',
  'interpolatePiYG',
  'interpolatePuOr',
  'interpolateRdBu',
  'interpolateRdGy',
  'interpolateRdYlBu',
  'interpolateRdYlGn',

  // Single-Hue Sequential
  'interpolateBlues',
  'interpolatePurples',
  'interpolateGreens',
  'interpolateGreys',
  'interpolateOranges',
  'interpolateReds',

  // Multi-Hue Sequential
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
]

const ChromaticPaletteComponent: React.FC<Props> = () => {
  const methods = useForm({})
  const onSubmit = ({ steps, interpolator }) => {
    steps = parseInt(steps)
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
  }

  return (
    <FormContext {...methods}>
      <div className="plugin-body">
        <div className="flex">
          <h2 className="section-title flex-1">Chromatic Scheme Palette</h2>
        </div>
        <p className="info">
          Create a palette by sampling from the chromatic color scheme.
        </p>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="form-row">
            <FigmaInput name="steps" type="number" defaultValue={9} />
          </div>
          <div style={{ paddingBottom: '30px' }}>
            {interpolators.map((t, i) => (
              <div className="ramp-row" key={t}>
                <input
                  type="hidden"
                  name="interpolator"
                  ref={methods.register}
                />
                <ColorRamp
                  interpolator={t}
                  width={310}
                  height={24}
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
