import { surfaces, stateById } from './odontogramModel'
import styles from './OdontogramPage.module.css'

export function ToothDiagram({ tooth, selectedFace, onSelectFace }) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={styles.toothSvg}
      aria-label={onSelectFace ? 'Superficies del diente' : undefined}
      aria-hidden={onSelectFace ? undefined : true}
    >
      {surfaces.map(({ id, label, x, y, width, height, radius }) => {
        const state = stateById[tooth?.faces[id] ?? 'sano']
        return (
          <rect
            key={id}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={radius}
            fill={state.color}
            stroke={selectedFace === id ? '#0284c7' : '#334155'}
            strokeWidth={selectedFace === id ? 5 : 2.5}
            role={onSelectFace ? 'button' : undefined}
            tabIndex={onSelectFace ? 0 : undefined}
            aria-label={onSelectFace ? `${label}: ${state.label}` : undefined}
            aria-pressed={onSelectFace ? selectedFace === id : undefined}
            onClick={onSelectFace ? () => onSelectFace(id) : undefined}
            onKeyDown={
              onSelectFace
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelectFace(id)
                    }
                  }
                : undefined
            }
          />
        )
      })}
    </svg>
  )
}
