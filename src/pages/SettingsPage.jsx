import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuth } from '@/contexts/AuthContext'
import { Gear, Key, Download, Warning } from '@phosphor-icons/react'

export function SettingsPage() {
  const { logout } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const passwordMutation = useMutation({
    mutationFn: (data) => api.changePassword(data),
    onSuccess: () => {
      setSuccess('Password updated successfully.')
      setError('')
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
    },
    onError: (err) => {
      setError(err.message)
      setSuccess('')
    },
  })

  function handlePasswordSubmit(e) {
    e.preventDefault()
    setSuccess('')
    setError('')
    if (!currentPassword || !newPassword) {
      setError('All fields are required.')
      return
    }
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters.')
      return
    }
    if (newPassword !== confirm) {
      setError('New passwords do not match.')
      return
    }
    passwordMutation.mutate({ currentPassword, newPassword })
  }

  async function handleExport() {
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
      setError('Failed to export data.')
    }
  }

  return (
    <div className="space-y-8 max-w-lg">
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
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div>
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <Warning weight="fill" className="w-4 h-4" />
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-emerald-500 font-medium">{success}</p>
          )}

          <button
            type="submit"
            disabled={passwordMutation.isPending}
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
