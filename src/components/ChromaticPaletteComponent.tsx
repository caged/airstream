import * as React from 'react'
import { scaleLinear, scaleSequential } from 'd3-scale'
import * as scales from 'd3-scale-chromatic'
import { useForm } from 'react-hook-form'
import { figmaChromaticInterpolator } from '../utilities'

interface Props {}

const interpolators = [
  'interpolateBlues',
  'interpolateBrBG',
  'interpolateBuGn',
  'interpolateBuPu',
  'interpolateCividis',
  'interpolateCool',
  'interpolateCubehelixDefault',
  'interpolateGnBu',
  'interpolateGreens',
  'interpolateGreys',
  'interpolateInferno',
  'interpolateMagma',
  'interpolateOrRd',
  'interpolateOranges',
  'interpolatePRGn',
  'interpolatePiYG',
  'interpolatePlasma',
  'interpolatePuBu',
  'interpolatePuBuGn',
  'interpolatePuOr',
  'interpolatePuRd',
  'interpolatePurples',
  'interpolateRainbow',
  'interpolateRdBu',
  'interpolateRdGy',
  'interpolateRdPu',
  'interpolateRdYlBu',
  'interpolateRdYlGn',
  'interpolateReds',
  'interpolateSinebow',
  'interpolateSpectral',
  'interpolateTurbo',
  'interpolateViridis',
  'interpolateWarm',
  'interpolateYlGn',
  'interpolateYlGnBu',
  'interpolateYlOrBr',
  'interpolateYlOrRd',
]

const ChromaticPaletteComponent: React.FC<Props> = () => {
  const { handleSubmit, register } = useForm({})

  const onSubmit = ({ steps, interpolator }) => {
    steps = parseInt(steps)
    const scale = scaleSequential(
      figmaChromaticInterpolator(interpolator)
    ).domain([0, steps])

    const colors = [...Array(steps).keys()].map(scale)
    const pluginMessage = { action: 'generateSwatches', colors }
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
          <input type="number" name="steps" ref={register} defaultValue={6} />
          <select name="interpolator" ref={register}>
            {interpolators.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
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
