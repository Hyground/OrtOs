import { useState } from 'react'
import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { TextAreaField } from '@/components/ui/TextAreaField/TextAreaField'
import { blankTooth, dentitionStates, surfaces, toothZone } from './odontogramModel'
import { ToothDiagram } from './ToothDiagram'
import styles from './OdontogramPage.module.css'

export function ToothEditor({ number, tooth, dentition, onClose, onSave }) {
  const [draft, setDraft] = useState(() => {
    const initial = tooth ?? blankTooth()
    return { ...initial, faces: { ...initial.faces } }
  })
  const [face, setFace] = useState('center')
  const [error, setError] = useState('')
  return (
    <Modal open title={`Diente ${number}`} onClose={onClose}>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          try {
            onSave({ ...draft, treatment: draft.treatment.trim(), notes: draft.notes.trim() })
            onClose()
          } catch {
            setError('No se pudo guardar el diente. Intenta nuevamente.')
          }
        }}
      >
        <p className={styles.zone}>{toothZone(number)}</p>
        <div className={styles.editorGrid}>
          <div className={styles.largeTooth}>
            <ToothDiagram tooth={draft} selectedFace={face} onSelectFace={setFace} />
          </div>
          <fieldset className={styles.statePicker}>
            <legend>Superficie: {surfaces.find(({ id }) => id === face).label}</legend>
            {dentitionStates(dentition).map((state) => (
              <label key={state.id}>
                <input
                  type="radio"
                  name="tooth-state"
                  value={state.id}
                  checked={draft.faces[face] === state.id}
                  onChange={() =>
                    setDraft({ ...draft, faces: { ...draft.faces, [face]: state.id } })
                  }
                />
                <span className={styles.dot} style={{ background: state.color }} />
                {state.label}
              </label>
            ))}
          </fieldset>
        </div>
        <TextField
          label="Tratamiento indicado (opcional)"
          value={draft.treatment}
          maxLength={200}
          onChange={(event) => setDraft({ ...draft, treatment: event.target.value })}
        />
        <TextAreaField
          label="Observación (opcional)"
          value={draft.notes}
          maxLength={1500}
          rows={3}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
        />
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div className={styles.formActions}>
          <Button
            variant="ghost"
            onClick={() => {
              setDraft(blankTooth())
              setFace('center')
              setError('')
            }}
          >
            Limpiar
          </Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Modal>
  )
}
