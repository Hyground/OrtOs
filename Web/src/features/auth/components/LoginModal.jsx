import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/routes/paths'
import { Modal } from '@/components/ui/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import { TextField } from '@/components/ui/TextField/TextField'
import { IconGoogle, IconLock, IconMail } from '@/components/icons/icons'
import { HttpError } from '@/lib/http/HttpError'
import { useAuth } from '../hooks/useAuth'
import { useAuthDialog } from '../hooks/useAuthDialog'
import { authService } from '../services/authService'
import { validateEmail, validatePassword } from '../validation/authRules'
import { emailErrorMessages, passwordErrorMessages } from '../validation/messages'
import styles from './LoginModal.module.css'

const NO_ERRORS = { email: null, password: null }

function resolveError(error) {
  if (error instanceof HttpError && error.isUnauthorized) return 'Correo o contraseña incorrectos.'
  if (error instanceof HttpError && error.isNetwork)
    return 'No se pudo conectar. Revisá tu conexión.'
  return 'Ocurrió un error. Intentá de nuevo.'
}

export function LoginModal() {
  const { isOpen, close } = useAuthDialog()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState(NO_ERRORS)
  const [formError, setFormError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [recoverSent, setRecoverSent] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) return
    setMode('login')
    setEmail('')
    setPassword('')
    setFieldErrors(NO_ERRORS)
    setFormError(null)
    setNotice(null)
    setRecoverSent(false)
    setLoading(false)
  }, [isOpen])

  const switchMode = (next) => {
    setMode(next)
    setFieldErrors(NO_ERRORS)
    setFormError(null)
    setNotice(null)
    setRecoverSent(false)
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    const emailCheck = validateEmail(email)
    const passwordCheck = validatePassword(password)
    if (!emailCheck.valid || !passwordCheck.valid) {
      setFieldErrors({
        email: emailCheck.valid ? null : emailErrorMessages[emailCheck.error],
        password: passwordCheck.valid ? null : passwordErrorMessages[passwordCheck.error],
      })
      return
    }
    setFieldErrors(NO_ERRORS)
    setFormError(null)
    setLoading(true)
    try {
      await login({ email, password })
      close()
      navigate(paths.dashboard)
    } catch (error) {
      setFormError(resolveError(error))
    } finally {
      setLoading(false)
    }
  }

  const submitRecover = async (event) => {
    event.preventDefault()
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      setFieldErrors({ email: emailErrorMessages[emailCheck.error], password: null })
      return
    }
    setFieldErrors(NO_ERRORS)
    setFormError(null)
    setLoading(true)
    try {
      await authService.requestPasswordReset({ email })
      setRecoverSent(true)
    } catch (error) {
      setFormError(resolveError(error))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    setNotice('El inicio con Google se habilitará pronto.')
  }

  const title = mode === 'login' ? 'Iniciar sesión' : 'Recuperar contraseña'

  return (
    <Modal open={isOpen} onClose={close} title={title}>
      {mode === 'login' && (
        <form className={styles.form} onSubmit={submitLogin} noValidate>
          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            icon={IconMail}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
          />
          <TextField
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            icon={IconLock}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
          />

          <button type="button" className={styles.link} onClick={() => switchMode('recover')}>
            ¿Olvidaste tu contraseña?
          </button>

          {formError && <p className={styles.formError}>{formError}</p>}

          <Button type="submit" block disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </Button>

          <div className={styles.divider}>
            <span>o</span>
          </div>

          <Button type="button" variant="secondary" block onClick={handleGoogle}>
            <IconGoogle />
            Continuar con Google
          </Button>
          {notice && <p className={styles.notice}>{notice}</p>}
        </form>
      )}

      {mode === 'recover' && recoverSent && (
        <div className={styles.form}>
          <p className={styles.hint}>
            Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.
          </p>
          <Button type="button" block onClick={() => switchMode('login')}>
            Volver a iniciar sesión
          </Button>
        </div>
      )}

      {mode === 'recover' && !recoverSent && (
        <form className={styles.form} onSubmit={submitRecover} noValidate>
          <p className={styles.hint}>
            Ingresá tu correo y te enviaremos un enlace para restablecerla.
          </p>
          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            icon={IconMail}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
          />

          {formError && <p className={styles.formError}>{formError}</p>}

          <Button type="submit" block disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </Button>
          <button type="button" className={styles.link} onClick={() => switchMode('login')}>
            Volver a iniciar sesión
          </button>
        </form>
      )}
    </Modal>
  )
}
