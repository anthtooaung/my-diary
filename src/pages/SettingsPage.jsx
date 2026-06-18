import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuth } from '@/contexts/AuthContext'
import { Gear, Key, Download, Warning } from '@phosphor-icons/react'
import { passwordChangeSchema } from '@/lib/schemas'

export function SettingsPage() {
  const { logout } = useAuth()
  const [success, setSuccess] = useState('')
  const [exportError, setExportError] = useState('')

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  })

  const passwordMutation = useMutation({
    mutationFn: (data) => api.changePassword(data),
    onSuccess: () => {
      setSuccess('Password updated successfully.')
      reset()
    },
    onError: (err) => {
      // react-hook-form handles field errors; server errors go here
    },
  })

  function onSubmit(data) {
    setSuccess('')
    passwordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword })
  }

  async function handleExport() {
    setExportError('')
    try {
      const data = await api.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `diary-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setExportError('Failed to export data.')
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
        <Gear weight="duotone" className="w-5 h-5 text-primary" />
        Settings
      </h2>

      {/* Change password */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Key weight="duotone" className="w-4 h-4 text-muted-foreground" />
          Change Password
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <input
              type="password"
              placeholder="Current password"
              {...register('currentPassword')}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="New password"
              {...register('newPassword')}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm new password"
              {...register('confirm')}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            {errors.confirm && (
              <p className="text-sm text-destructive mt-1">{errors.confirm.message}</p>
            )}
          </div>

          {passwordMutation.isError && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <Warning weight="fill" className="w-4 h-4" />
              {passwordMutation.error.message}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-500 font-medium">{success}</p>
          )}

          <button
            type="submit"
            disabled={passwordMutation.isPending || !isValid}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {passwordMutation.isPending ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </section>

      {/* Data export */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Download weight="duotone" className="w-4 h-4 text-muted-foreground" />
          Data Export
        </h3>
        <p className="text-sm text-muted-foreground">
          Download all your diary entries, goals, and settings as a JSON file.
        </p>
        {exportError && (
          <p className="text-sm text-destructive flex items-center gap-1.5">
            <Warning weight="fill" className="w-4 h-4" />
            {exportError}
          </p>
        )}
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition-colors"
        >
          <Download weight="bold" className="w-4 h-4" />
          Export Data
        </button>
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
          <Warning weight="duotone" className="w-4 h-4" />
          Sign Out
        </h3>
        <p className="text-sm text-muted-foreground">
          Sign out of your diary. You can always sign back in with your password.
        </p>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Sign Out
        </button>
      </section>
    </div>
  )
}
