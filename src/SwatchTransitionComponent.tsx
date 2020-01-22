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
    const name = isColorChange ? `fill[${index}].hex` : `fill[${index}].color`

    if (isColorChange || value.length > 5) {
      const val = (isColorChange
        ? value.replace(/#/, '')
        : `#${value}`
      ).toUpperCase()
      setValue(name, val)
    }
  }

  return (
    <div>
      {errors.steps && <p>Steps is required</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-row">
          <label htmlFor="steps">Steps</label>
          <input
            name="steps"
            type="number"
            ref={register({ required: true })}
          />
        </div>
        <div>
          {fields.map((item, index) => {
            return (
              <div key={item.id}>
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
                    defaultValue={defaultColor.replace(/#/, '')}
                    ref={register}
                    name={`fill[${index}].hex`}
                    onChange={handleChange}
                    data-index={index}
                    maxLength={6}
                  />
                </div>
                {fields.length > 2 && index >= 2 && (
                  <button onClick={() => remove(index)}>-</button>
                )}
              </div>
            )
          })}
        </div>
        <div>
          <button type="button" onClick={() => append({ color: defaultColor })}>
            append
          </button>
        </div>
        <input type="submit" value="Submit" />
      </form>
    </div>
  )
}

export default SwatchTransitionComponent
