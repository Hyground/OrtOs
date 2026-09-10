import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
export function useModuleDialogs() {
  const [params, setParams] = useSearchParams()
  const [editing, setEditing] = useState(null)
  const [record, setRecord] = useState(null)
  const [adding, setAdding] = useState(null)
  const [notice, setNotice] = useState('')
  const open = params.get('nuevo') === '1' || !!editing
  const close = () => {
    setEditing(null)
    setParams(
      (p) => {
        p.delete('nuevo')
        return p
      },
      { replace: true },
    )
  }
  const create = () => {
    setEditing(null)
    setParams((p) => {
      p.set('nuevo', '1')
      return p
    })
  }
  return {
    open,
    editing,
    setEditing,
    record,
    setRecord,
    adding,
    setAdding,
    notice,
    setNotice,
    close,
    create,
    onSaved: () => {
      close()
      setNotice('Registro guardado correctamente.')
    },
  }
}
