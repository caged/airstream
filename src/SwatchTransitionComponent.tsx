import * as React from 'react'
import { useForm, useFieldArray } from 'react-hook-form'

const SwatchTransitionComponent: React.FC = () => {
  const defaultColor = '#23ABD8'

  const { handleSubmit, setValue, register, control, errors } = useForm({
    defaultValues: {
      fill: [{ color: defaultColor }, { color: defaultColor }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fill',
  })

  const onSubmit = (data) => {
    console.log(data)
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

  const handleFocus = (event) => {
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
          <svg height="12" width="12">
            <line
              x1="0"
              y1="6"
              x2="12"
              y2="6"
              style={{
                lineWidth: 2,
                stroke: '#333333',
                shapeRendering: 'crisp-edges',
              }}
            />
            <line
              x1="6"
              y1="0"
              x2="6"
              y2="12"
              style={{
                lineWidth: 2,
                stroke: '#333333',
                shapeRendering: 'crisp-edges',
              }}
            />
          </svg>
        </button>
      </div>
      <p className="info">
        Create a blended palette from a list of fills using the given number of
        steps.
      </p>

      {errors.steps && <p>Steps is required</p>}
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
            return (
              <div key={item.id} className="form-row-item">
                <div className="flex-1">
                  <div className="color-input">
                    <input
                      type="color"
                      name={`fill[${index}].color`}
                      defaultValue={item.color}
                      ref={register}
                      onChange={handleChange}
                      data-index={index}
                    />
                    <input
                      type="text"
                      size={7}
                      defaultValue={defaultColor.replace(/#/, '')}
                      ref={register}
                      name={`fill[${index}].name`}
                      onChange={handleChange}
                      onFocus={handleFocus}
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
                      <svg height="1" width="12">
                        <line
                          x1="0"
                          y1="0"
                          x2="12"
                          y2="0"
                          style={{
                            lineWidth: 1,
                            stroke: '#111111',
                            shapeRendering: 'crisp-edges',
                          }}
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <input type="submit" value="Submit" className="btn-primary" />
      </form>
    </div>
  )
}

export default SwatchTransitionComponent
