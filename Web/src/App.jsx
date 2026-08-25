import { useEffect, useState } from 'react'

const apiUrl = import.meta.env.VITE_API_URL ?? ''

export default function App() {
  const [mensaje, setMensaje] = useState('Conectando con la API…')

  useEffect(() => {
    fetch(`${apiUrl}/api/saludo`)
      .then((response) => {
        if (!response.ok) throw new Error('La API no respondió correctamente')
        return response.json()
      })
      .then((data) => setMensaje(data.mensaje))
      .catch(() => setMensaje('No fue posible conectar con la API'))
  }, [])

  return (
    <main>
      <h1>OrtOs</h1>
      <p>{mensaje}</p>
    </main>
  )
}

