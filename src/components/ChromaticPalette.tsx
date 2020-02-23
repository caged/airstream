import * as React from 'react'
import { scaleSequential } from 'd3-scale'
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

const ChromaticPalette: React.FC<Props> = () => {
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
      offsetY: 0,
    }
    parent.postMessage({ pluginMessage }, '*')
  }

  // Set the active interpolator and manage the
  // focus visual style
  const setActiveColorRamp = (el, interpolator) => {
    document
      .querySelectorAll('.palette')
      .forEach((e) => e.classList.remove('focused'))
    el.classList.add('focused')
    methods.setValue('interpolator', interpolator, true)
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
            <FigmaInput
              name="steps"
              type="number"
              defaultValue={9}
              title="steps"
            />
          </div>
          <div style={{ paddingBottom: '20px' }}>
            <input
              title="interpolator"
              type="hidden"
              name="interpolator"
              ref={methods.register}
              defaultValue="interpolateRainbow"
            />
            {Object.keys(interpolators).map((label) => (
              <div key={label} className="ramp-group">
                <h3>{label}</h3>
                {interpolators[label].map((t) => (
                  <div key={t} className="ramp-row">
                    <ColorRamp
                      interpolator={t}
                      width={310}
                      height={12}
                      onClick={(e) => setActiveColorRamp(e.currentTarget, t)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="form-row primary-actions">
            <input
              title="Submit"
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

export default ChromaticPalette
