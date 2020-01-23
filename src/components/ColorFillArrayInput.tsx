import * as React from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'

interface ColorFillArrayProps {
  name: string
  appendRef: React.MutableRefObject<any>
}

function ColorFillArrayInput({ name, appendRef }: ColorFillArrayProps) {
  const { register, control, formState, ...other } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  })

  console.log(appendRef)

  // appendRef && appendRef.current && appendRef.current.onClick = () => {
  //   console.log('clicking');

  //   append({ color: '#00ff00' })
  // }

  // const [indexes, setIndexes] = React.useState([])
  // const [counter, setCounter] = React.useState(0)
  // const { register } = useFormContext()

  // const addColor = () => {
  //   setIndexes((prevIndexes) => [...prevIndexes, counter])
  //   setCounter((prevCounter) => prevCounter + 1)
  // }

  // const removeColor = (index) => () => {
  //   setIndexes((prevIndexes) => [
  //     ...prevIndexes.filter((item) => item !== index),
  //   ])
  //   setCounter((prevCounter) => prevCounter - 1)
  // }
  console.log(fields, !formState.dirty)

  return (
    <div>
      test
      {fields.map((item, index) => {
        const fieldName = `${name}[${index}]`
        return (
          <div key={item.id}>
            <input
              name={`${fieldName}.color`}
              defaultValue={item.color}
              ref={register}
            />
            <button onClick={remove(index)}>remove</button>
          </div>
        )
      })}
    </div>
  )
}

export default ColorFillArrayInput
