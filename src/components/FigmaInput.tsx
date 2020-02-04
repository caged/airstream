import * as React from 'react'
import { useFormContext } from 'react-hook-form'

interface Props extends React.ComponentPropsWithoutRef<any> {
  name: string
}

const FigmaInput: React.FC<Props> = ({ name, ...props }: Props) => {
  const { register } = useFormContext()
  const className = `figma-input-container ${
    props.className ? props.className : ''
  }`

  delete props.className

  const focusAndSelectValue = (event) => {
    const { currentTarget } = event
    currentTarget.classList.add('focused')
    const input = currentTarget.querySelector('input')

    if (input) {
      input.focus()
      input.select()
    }
  }

  const unfocusInput = (event) => {
    event.target.parentNode.classList.remove('focused')
  }

  return (
    <div
      className={className}
      onClick={focusAndSelectValue}
      onBlur={unfocusInput}
      {...props}
    >
      <label htmlFor={name}>{name}</label>
      <input name={name} ref={register} className="figma-input" {...props} />
    </div>
  )
}

export default FigmaInput
