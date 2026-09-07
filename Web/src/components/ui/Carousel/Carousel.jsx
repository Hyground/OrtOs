import { useCallback, useEffect, useState } from 'react'
import { IconPause, IconPlay } from '@/components/icons/icons'
import styles from './Carousel.module.css'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Carousel({ images, interval = 4500, className, label = 'Galería de imágenes' }) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())
  const count = images.length

  const goTo = useCallback((position) => setIndex(((position % count) + count) % count), [count])

  const running = playing && !hovered

  useEffect(() => {
    if (!running || count < 2) return undefined
    const id = window.setInterval(() => setIndex((current) => (current + 1) % count), interval)
    return () => window.clearInterval(id)
  }, [running, count, interval, index])

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      role="group"
      aria-roledescription="carrusel"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <div className={styles.frame}>
        <div className={styles.viewport}>
          {images.map((image, position) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              loading={position === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={
                position === index ? `${styles.slide} ${styles.slideActive}` : styles.slide
              }
              aria-hidden={position !== index}
            />
          ))}

          <button
            type="button"
            className={styles.playToggle}
            aria-label={playing ? 'Pausar carrusel' : 'Reanudar carrusel'}
            onClick={() => setPlaying((value) => !value)}
          >
            {playing ? <IconPause /> : <IconPlay />}
          </button>

          <div className={styles.dots} role="tablist" aria-label="Seleccionar imagen">
            {images.map((image, position) => (
              <button
                key={image.src}
                type="button"
                role="tab"
                aria-selected={position === index}
                aria-label={`Imagen ${position + 1} de ${count}`}
                className={position === index ? `${styles.dot} ${styles.dotActive}` : styles.dot}
                onClick={() => goTo(position)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
