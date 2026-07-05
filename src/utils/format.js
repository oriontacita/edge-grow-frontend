// Small shared formatting/calculation helpers used across pages.

export function ageInMonths(dateOfBirth, referenceDate = new Date()) {
  if (!dateOfBirth) return null
  const dob = new Date(dateOfBirth)
  const ref = new Date(referenceDate)
  let months = (ref.getFullYear() - dob.getFullYear()) * 12
  months -= dob.getMonth()
  months += ref.getMonth()
  if (ref.getDate() < dob.getDate()) months -= 1
  return Math.max(months, 0)
}

export function formatAge(dateOfBirth) {
  const months = ageInMonths(dateOfBirth)
  if (months === null) return '-'
  if (months < 1) return 'Baru lahir'
  return `${months} Bulan`
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function genderLabel(gender) {
  return gender === 'female' ? 'Perempuan' : gender === 'male' ? 'Laki-laki' : '-'
}

export function initialsFromName(name) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}

// Maps a weight/length status string coming from the API
// (e.g. "normal", "risiko", "stunting") to display + color info.
export function statusMeta(status) {
  const normalized = (status || '').toLowerCase()
  if (normalized.includes('stunting') || normalized.includes('berat')) {
    return {
      label: 'STUNTING',
      badgeClass: 'bg-stunting-heavy-bg text-stunting-heavy',
    }
  }
  if (normalized.includes('resiko') || normalized.includes('risiko') || normalized.includes('moderate')) {
    return {
      label: 'RESIKO',
      badgeClass: 'bg-secondary-container/40 text-stunting-moderate',
    }
  }
  if (normalized.includes('normal')) {
    return {
      label: 'NORMAL',
      badgeClass: 'bg-secondary-fixed text-on-secondary-container',
    }
  }
  return {
    label: 'BELUM DIUKUR',
    badgeClass: 'bg-surface-container text-on-surface-variant',
  }
}
