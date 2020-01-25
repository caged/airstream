import * as React from 'react'
import { scaleSequential } from 'd3-scale'
import { useForm } from 'react-hook-form'
import { figmaChromaticInterpolator } from '../utilities'
import ColorRamp from './ColorRamp'

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
  const { handleSubmit, register, setValue } = useForm({})

  const focusAndSelectValue = (event) => {
    const { target } = event
    const input = target.querySelector('input')
    target.classList.add('focused')

    if (input) {
      input.focus()
      input.select()
    }
  }

  const unfocusInput = (event) => {
    event.target.parentNode.classList.remove('focused')
  }

  const onSubmit = ({ steps, interpolator }) => {
    steps = parseInt(steps)
    const scale = scaleSequential(
      figmaChromaticInterpolator(interpolator)
    ).domain([0, steps])

    // We could use quantize, but it has two important differences.
    // 1. For continuos scales, it generates idential swatches at the edges
    // 2. Due to the dynamics of 1, I find it produces a harshes transition.
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
    <div className="plugin-body">
      <div className="flex">
        <h2 className="section-title flex-1">Chromatic Scheme Palette</h2>
      </div>
      <p className="info">
        Create a palette by sampling from the chromatic color scheme.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-row">
          <div className="icon-input" onClick={focusAndSelectValue}>
            <label htmlFor="steps">Steps</label>
            <input
              className="steps ml-1 mr-2"
              name="steps"
              type="number"
              min={2}
              max={50}
              ref={register({
                required: true,
                min: 2,
                max: 50,
              })}
              defaultValue={6}
              onBlur={unfocusInput}
            />
          </div>
        </div>
        <div>
          {interpolators.map((t) => (
            <div className="ramp-row" key={t}>
              <input
                type="radio"
                name="interpolator"
                value={t}
                ref={register}
                onChange={(e) => setValue('interpolator', e.target.value, true)}
              />
              <ColorRamp interpolator={t} width={288} height={24} />
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
  )
}

export default ChromaticPaletteComponent
