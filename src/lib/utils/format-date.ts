export function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "à l'instant"
  if (diffMins < 60) return `il y a ${diffMins} min`
  if (diffHours < 24) return `il y a ${diffHours} h`
  if (diffDays < 30) return `il y a ${diffDays} j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
