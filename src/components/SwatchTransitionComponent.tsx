import * as React from 'react'
import { useForm, FormContext } from 'react-hook-form'
import ColorFillArrayInput from './ColorFillArrayInput'

const SwatchTransitionComponent: React.FC = () => {
  const defaultColor = '#23ABD8'

  const methods = useForm({
    defaultValues: {
      fill: [{ color: defaultColor }, { color: defaultColor }],
    },
  })

  const { handleSubmit, register } = methods

  // const { fields, append, remove } = useFieldArray({
  //   control,
  //   name: 'fill',
  // })

  const onSubmit = (data) => {
    parent.postMessage({ pluginMessage: { data } }, '*')
  }

  // const handleChange = (event) => {
  //   console.log('changing')

  //   const { type, value, dataset } = event.target
  //   const index = dataset.index
  //   const isColorChange = type === 'color'
  //   const name = isColorChange ? `fill[${index}].name` : `fill[${index}].color`

  //   if (isColorChange || value.length > 5) {
  //     const val = (isColorChange
  //       ? value.replace(/#/, '')
  //       : `#${value}`
  //     ).toUpperCase()
  //     setValue(name, val)
  //   }
  // }

  // const handleFocus = (event) => {
  //   event.target.select()
  // }

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

  interface RefButtonProps {
    children: React.ReactNode
    className: string
  }

  const RefButton = React.forwardRef(function RefButtonFunc(
    props: RefButtonProps,
    ref: React.LegacyRef<HTMLButtonElement>
  ) {
    return <button ref={ref}>{props.children}</button>
  })

  const ref = React.createRef<HTMLButtonElement>()

  return (
    <div className="plugin-body">
      <div className="flex">
        <h2 className="section-title flex-1">Swatch Blend</h2>
        <RefButton className="btn-icon plus" ref={ref}>
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
        </RefButton>
      </div>
      <p className="info">
        Create a blended palette from a list of fills using the given number of
        steps.
      </p>

      <FormContext {...methods}>
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
            <ColorFillArrayInput name="fill" appendRef={ref} />
          </div>
          <input type="submit" value="Submit" className="btn-primary" />
        </form>
      </FormContext>
    </div>
  )
}

export default SwatchTransitionComponent
