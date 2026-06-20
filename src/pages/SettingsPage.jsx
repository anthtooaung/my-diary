import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/api'
import { useAuth } from '@/contexts/AuthContext'
import { Gear, Key, Download, Upload, Warning, Robot } from '@phosphor-icons/react'
import { passwordChangeSchema, aiKeySchema } from '@/lib/schemas'

export function SettingsPage() {
  const { logout } = useAuth()
  const [success, setSuccess] = useState('')
  const [exportError, setExportError] = useState('')
  const [aiSuccess, setAiSuccess] = useState('')
  const [importState, setImportState] = useState({ status: 'idle', message: '', preview: null })
  const fileRef = useRef(null)

  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  })

  const { register: registerAi, handleSubmit: handleAiSubmit, reset: resetAi, formState: { errors: aiErrors, isValid: aiValid } } = useForm({
    resolver: zodResolver(aiKeySchema),
    defaultValues: { apiKey: '' },
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

  const aiKeyMutation = useMutation({
    mutationFn: (data) => api.setAIKey(data.apiKey),
    onSuccess: () => {
      setAiSuccess('API key saved.')
      resetAi()
      setTimeout(() => setAiSuccess(''), 3000)
    },
  })

  function onSubmit(data) {
    setSuccess('')
    passwordMutation.mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword })
  }

  function onAiSubmit(data) {
    setAiSuccess('')
    aiKeyMutation.mutate(data)
  }

  const importMutation = useMutation({
    mutationFn: ({ mode, data }) => api.importData(mode, data),
    onSuccess: (result) => {
      setImportState({
        status: 'success',
        message: `Imported ${result.importedEntries} entries and ${result.importedGoals} goals.`,
        preview: null,
      })
      if (fileRef.current) fileRef.current.value = ''
    },
    onError: (err) => {
      setImportState({ status: 'error', message: err.message, preview: null })
    },
  })

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setImportState({ status: 'idle', message: '', preview: null })

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        if (!json.entries && !json.goals) {
          setImportState({ status: 'error', message: 'Invalid file: must contain entries or goals.', preview: null })
          return
        }
        setImportState({
          status: 'preview',
          message: '',
          preview: {
            entries: json.entries?.length || 0,
            goals: json.goals?.length || 0,
            exportedAt: json.exportedAt,
            data: json,
          },
        })
      } catch {
        setImportState({ status: 'error', message: 'Invalid JSON file.', preview: null })
      }
    }
    reader.readAsText(file)
  }

  function handleImport(mode) {
    if (!importState.preview?.data) return
    importMutation.mutate({ mode, data: importState.preview.data })
  }

  function cancelImport() {
    setImportState({ status: 'idle', message: '', preview: null })
    if (fileRef.current) fileRef.current.value = ''
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

      {/* AI API key */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Robot weight="duotone" className="w-4 h-4 text-muted-foreground" />
          AI Integration
        </h3>
        <p className="text-sm text-muted-foreground">
          Provide your OpenAI API key to enable the AI Goal Coach, Year in Review, and AI Digest features.
          Your key is stored in the database and never sent to the browser.
        </p>
        <form onSubmit={handleAiSubmit(onAiSubmit)} className="space-y-3">
          <div>
            <input
              type="password"
              placeholder="sk-…"
              {...registerAi('apiKey')}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm font-mono"
            />
            {aiErrors.apiKey && (
              <p className="text-sm text-destructive mt-1">{aiErrors.apiKey.message}</p>
            )}
          </div>

          {aiKeyMutation.isError && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <Warning weight="fill" className="w-4 h-4" />
              {aiKeyMutation.error.message}
            </p>
          )}
          {aiSuccess && (
            <p className="text-sm text-emerald-500 font-medium">{aiSuccess}</p>
          )}

          <button
            type="submit"
            disabled={aiKeyMutation.isPending || !aiValid}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {aiKeyMutation.isPending ? 'Saving…' : 'Save API Key'}
          </button>
        </form>
      </section>

      {/* Data export & import */}
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

      {/* Data import */}
      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Upload weight="duotone" className="w-4 h-4 text-muted-foreground" />
          Data Import
        </h3>
        <p className="text-sm text-muted-foreground">
          Restore entries and goals from a previously exported JSON file.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="block text-sm text-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 file:cursor-pointer"
        />

        {importState.status === 'error' && (
          <p className="text-sm text-destructive flex items-center gap-1.5">
            <Warning weight="fill" className="w-4 h-4" />
            {importState.message}
          </p>
        )}

        {importState.status === 'success' && (
          <p className="text-sm text-emerald-500 font-medium">{importState.message}</p>
        )}

        {importState.status === 'preview' && importState.preview && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm space-y-1">
              <p className="font-medium text-foreground">File contents:</p>
              <p className="text-muted-foreground">
                {importState.preview.entries} entries, {importState.preview.goals} goals
                {importState.preview.exportedAt && (
                  <> (exported {new Date(importState.preview.exportedAt).toLocaleDateString()})</>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleImport('merge')}
                disabled={importMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {importMutation.isPending ? 'Importing…' : 'Merge (add to existing)'}
              </button>
              <button
                onClick={() => handleImport('replace')}
                disabled={importMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/50 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {importMutation.isPending ? 'Importing…' : 'Replace all'}
              </button>
              <button
                onClick={cancelImport}
                disabled={importMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Merge</strong> adds imported data alongside existing entries.
              <strong className="text-destructive"> Replace</strong> deletes all current entries and goals first.
            </p>
          </div>
        )}
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
