import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, SignIn } from '@phosphor-icons/react'
import { useAuth } from '@/contexts/AuthContext'
import { loginSchema } from '@/lib/schemas'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: '' },
  })
  const password = watch('password')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(data) {
    setServerError('')
    setSubmitting(true)
    try {
      await login(data.password)
    } catch (err) {
      setServerError(err.message || 'Invalid password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm mx-4">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Lock weight="fill" className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">My Diary</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Enter your password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Password"
              {...register('password')}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              autoFocus
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1.5">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-destructive font-medium">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !isValid}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
            ) : (
              <SignIn weight="bold" className="w-4 h-4" />
            )}
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
