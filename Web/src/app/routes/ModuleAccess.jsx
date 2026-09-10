import { useAuth } from '@/features/auth/hooks/useAuth'
import { canAccess } from '@/features/auth/permissions'
import { Button } from '@/components/ui/Button/Button'
import { paths } from './paths'
export function ModuleAccess({ path, children }) {
  const { user } = useAuth()
  if (!canAccess(user, path))
    return (
      <section>
        <h1>Acceso restringido</h1>
        <p>Tu perfil no tiene acceso a este módulo.</p>
        <Button to={paths.dashboard}>Volver a mi panel</Button>
      </section>
    )
  return children
}
