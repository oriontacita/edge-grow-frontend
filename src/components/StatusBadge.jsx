import { statusMeta } from '../utils/format'

export default function StatusBadge({ status }) {
  const { label, badgeClass } = statusMeta(status)
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${badgeClass}`}
    >
      {label}
    </span>
  )
}
