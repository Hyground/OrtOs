import { useEffect, useState } from 'react'
import { servicesService } from './servicesService'

export function useServices() {
  const [state, setState] = useState({ status: 'loading', services: [], fromFallback: false })

  useEffect(() => {
    let active = true
    servicesService.list().then(({ services, fromFallback }) => {
      if (!active) return
      setState({ status: 'ready', services, fromFallback })
    })
    return () => {
      active = false
    }
  }, [])

  return state
}
