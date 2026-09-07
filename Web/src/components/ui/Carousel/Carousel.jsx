import { useCallback, useEffect, useState } from 'react'
import styles from './Carousel.module.css'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Carousel({ images, interval = 4500, className }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = images.length

  const goTo = useCallback((position) => setIndex(((position % count) + count) % count), [count])

  useEffect(() => {
    if (paused || count < 2 || prefersReducedMotion()) return undefined
    const id = window.setInterval(() => setIndex((current) => (current + 1) % count), interval)
    return () => window.clearInterval(id)
  }, [paused, count, interval])

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      aria-roledescription="carrusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className={styles.frame}>
        <div className={styles.viewport}>
          {images.map((image, position) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              loading={position === 0 ? 'eager' : 'lazy'}
              className={
                position === index ? `${styles.slide} ${styles.slideActive}` : styles.slide
              }
              aria-hidden={position !== index}
            />
          ))}

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
