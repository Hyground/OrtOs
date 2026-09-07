import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Carousel } from './Carousel'

const images = [
  { src: '/a.webp', alt: 'A' },
  { src: '/b.webp', alt: 'B' },
]

describe('Carousel', () => {
  it('muestra la primera imagen como activa', () => {
    render(<Carousel images={images} />)
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Imagen 1 de 2')
  })

  it('cambia de imagen al pulsar un indicador', async () => {
    const user = userEvent.setup()
    render(<Carousel images={images} />)
    await user.click(screen.getByRole('tab', { name: 'Imagen 2 de 2' }))
    expect(screen.getByRole('tab', { selected: true })).toHaveAccessibleName('Imagen 2 de 2')
  })
})
