'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import type { AdminActionState } from '@/lib/actions/admin.actions'

interface Props {
  action: (prevState: AdminActionState, formData: FormData) => Promise<AdminActionState>
  hiddenFields: Record<string, string>
  confirmMessage: string
  onSuccess?: (msg: string) => void
  onError?: (msg: string) => void
  label?: string
}

export function DeleteButton({ action, hiddenFields, confirmMessage, onSuccess, onError, label }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!window.confirm(confirmMessage)) return
    const formData = new FormData()
    Object.entries(hiddenFields).forEach(([k, v]) => formData.set(k, v))
    startTransition(async () => {
      const result = await action({}, formData)
      if (result.success) onSuccess?.(result.success)
      else if (result.error) onError?.(result.error)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <Trash2 className="h-3.5 w-3.5" />}
      {label ?? 'Supprimer'}
    </button>
  )
}
