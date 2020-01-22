import * as React from 'react'
import { useFormContext } from 'react-hook-form'

interface ColorFillArrayProps {
  name: string
}

function ColorFillArrayInput({ name }: ColorFillArrayProps) {
  const [indexes, setIndexes] = React.useState([])
  const [counter, setCounter] = React.useState(0)
  const { register } = useFormContext()

  const addColor = () => {
    setIndexes((prevIndexes) => [...prevIndexes, counter])
    setCounter((prevCounter) => prevCounter + 1)
  }

  const removeColor = (index) => () => {
    setIndexes((prevIndexes) => [
      ...prevIndexes.filter((item) => item !== index),
    ])
    setCounter((prevCounter) => prevCounter - 1)
  }

  return (
    <div>
      <button onClick={addColor}>add +</button>
      {indexes.map((index) => {
        const fieldName = `${name}[${index}]`
        return (
          <div key={fieldName}>
            <input name={`${fieldName}.color`} ref={register} />
            <button onClick={removeColor(index)}>remove</button>
          </div>
        )
      })}
    </div>
  )
}

export default ColorFillArrayInput
