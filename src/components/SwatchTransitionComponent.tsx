import * as React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { generateColorTransition } from '../utilities'

const SwatchTransitionComponent: React.FC = () => {
  const defaultColor = '#CCCCCC'
  const { handleSubmit, setValue, register, control, errors } = useForm({
    defaultValues: {
      fill: [{ color: defaultColor }, { color: '#4A23D8' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'fill' })

  const onSubmit = (data) => {
    const { steps, fill } = data
    const colors = generateColorTransition({
      steps: parseInt(steps),
      colors: fill.map((f) => f.color),
    })
    const pluginMessage = { action: 'generateSwatches', colors }
    parent.postMessage({ pluginMessage }, '*')
  }

  const handleChange = (event) => {
    const { type, value, dataset } = event.target
    const index = dataset.index
    const isColorChange = type === 'color'
    const name = isColorChange ? `fill[${index}].name` : `fill[${index}].color`

    if (isColorChange || value.length > 5) {
      const val = (isColorChange
        ? value.replace(/#/, '')
        : `#${value}`
      ).toUpperCase()
      setValue(name, val)
    }
  }

  const selectTarget = (event) => {
    event.target.select()
  }

  const focusInput = (event) => {
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

  return (
    <div className="plugin-body">
      <div className="flex">
        <h2 className="section-title flex-1">Swatch Blend</h2>
        <button
          className="btn-icon plus"
          onClick={() => append({ color: defaultColor })}
        >
          &#x0002B;
        </button>
      </div>
      <p className="info">
        Create a blended palette from a list of fills using the given number of
        steps.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-row">
          <div className="icon-input" onClick={focusInput}>
            <label htmlFor="steps">Steps</label>
            <input
              className="steps ml-1 mr-2"
              name="steps"
              type="number"
              min={2}
              max={99}
              ref={register({ required: true })}
              defaultValue={3}
              onBlur={unfocusInput}
            />
          </div>
        </div>
        <div className="form-row">
          {fields.map((item, index) => {
            const name = `fill[${index}]`

            return (
              <div key={item.id} className="form-row-item">
                <div className="flex-1">
                  <div className="color-input">
                    <input
                      type="color"
                      name={`${name}.color`}
                      ref={register}
                      onChange={handleChange}
                      defaultValue={item.color}
                      data-index={index}
                    />
                    <input
                      type="text"
                      size={7}
                      defaultValue={item.color.replace(/#/, '').toUpperCase()}
                      ref={register}
                      name={`${name}.name`}
                      onChange={handleChange}
                      onFocus={selectTarget}
                      data-index={index}
                      maxLength={6}
                    />
                  </div>
                </div>
                <div className="actions flex-shrink">
                  {fields.length > 2 && index >= 2 && (
                    <button
                      className="btn-icon minus"
                      onClick={() => remove(index)}
                    >
                      &#x02500;
                    </button>
                  )}
                </div>
              </div>
            )
          })}
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

export default SwatchTransitionComponent
