import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import { getDashboard } from '../api/dashboard'
import { getLatestStatusForToddler } from '../utils/latestStatus'
import { formatAge, formatDate, genderLabel, initialsFromName } from '../utils/format'
import { useAuth } from '../context/AuthContext'

// Cap on how many toddlers we do the extra "latest status" lookup for, to
// avoid firing off hundreds of requests on a large posyandu. The dashboard
// endpoint itself does not return status, only identity + DOB fields.
const STATUS_LOOKUP_LIMIT = 24

export default function Dashboard() {
  const [toddlers, setToddlers] = useState([])
  const [statusById, setStatusById] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { username, village } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await getDashboard()
        const list = res.data?.data?.toddlers || []
        if (cancelled) return
        setToddlers(list)

        const subset = list.slice(0, STATUS_LOOKUP_LIMIT)
        const results = await Promise.all(
          subset.map(async (t) => ({ id: t.id, status: await getLatestStatusForToddler(t.id) })),
        )
        if (cancelled) return
        const map = {}
        results.forEach((r) => {
          map[r.id] = r.status
        })
        setStatusById(map)
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Gagal memuat data dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const total = toddlers.length
  const withStatus = Object.values(statusById).filter(Boolean)
  const normalCount = withStatus.filter(
    (s) => !isRisky(s.weightStatus) && !isRisky(s.lengthStatus) && !isStunting(s.weightStatus) && !isStunting(s.lengthStatus),
  ).length
  const riskCount = withStatus.filter(
    (s) => (isRisky(s.weightStatus) || isRisky(s.lengthStatus)) && !isStunting(s.weightStatus) && !isStunting(s.lengthStatus),
  ).length
  const stuntingCount = withStatus.filter((s) => isStunting(s.weightStatus) || isStunting(s.lengthStatus)).length

  function isRisky(status) {
    return (status || '').toLowerCase().includes('resiko') || (status || '').toLowerCase().includes('risiko')
  }
  function isStunting(status) {
    return (status || '').toLowerCase().includes('stunting')
  }

  return (
    <AppShell
      searchValue=""
      onSearchChange={undefined}
      breadcrumb={<span className="font-bold text-primary">Dashboard</span>}
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface leading-tight">
            Selamat datang, {username || 'Kader'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-primary text-sm">location_on</span>
            <p className="text-on-surface-variant font-medium text-sm">{village}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/data-anak/tambah')}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">person_add</span>
          Tambah Anak Baru
        </button>
      </header>

      {error && (
        <div className="mb-6 bg-error-container text-error px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard label="Total Balita" value={loading ? '-' : total} icon="group" sub="Anak" />
        <KpiCard
          label="Normal"
          value={loading ? '-' : normalCount}
          icon="sentiment_satisfied"
          valueClass="text-secondary"
          iconWrapClass="bg-secondary-container text-secondary"
        />
        <KpiCard
          label="Risiko"
          value={loading ? '-' : riskCount}
          icon="warning"
          valueClass="text-stunting-moderate"
          iconWrapClass="bg-[#FFF7E6] text-stunting-moderate"
          sub="Perlu Monitor"
        />
        <KpiCard
          label="Stunting"
          value={loading ? '-' : stuntingCount}
          icon="priority_high"
          valueClass="text-stunting-heavy"
          iconWrapClass="bg-stunting-heavy-bg text-stunting-heavy"
          sub="Rujukan Segera"
        />
      </section>
      {total > STATUS_LOOKUP_LIMIT && (
        <p className="text-xs text-on-surface-variant -mt-4 mb-8">
          Ringkasan status dihitung dari {STATUS_LOOKUP_LIMIT} data balita pertama untuk menjaga performa.
        </p>
      )}

      {/* Recent Toddlers Table */}
      <section className="bg-surface rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/30 flex justify-between items-center">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">child_care</span>
            Daftar Balita
          </h2>
          <button
            className="text-primary text-sm font-bold hover:underline"
            onClick={() => navigate('/data-anak')}
          >
            Lihat semua
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-on-surface-variant">Memuat data...</div>
        ) : toddlers.length === 0 ? (
          <div className="p-10 text-center text-on-surface-variant">Belum ada data balita.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-highest text-on-surface-variant text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Nama Anak</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Usia</th>
                  <th className="px-6 py-4">Status Terbaru</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest text-on-surface">
                {toddlers.slice(0, 8).map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-bold text-primary">
                          {initialsFromName(t.toddler_full_name)}
                        </div>
                        {t.toddler_full_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">{genderLabel(t.gender)}</td>
                    <td className="px-6 py-4">{formatAge(t.date_of_birth)}</td>
                    <td className="px-6 py-4">
                      {statusById[t.id] ? (
                        <StatusBadge status={statusById[t.id].weightStatus || statusById[t.id].lengthStatus} />
                      ) : (
                        <StatusBadge status={null} />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="w-10 h-10 inline-flex items-center justify-center hover:bg-surface-container rounded-md text-primary transition-colors"
                        onClick={() => navigate(`/data-anak/${t.id}`)}
                        aria-label="Lihat detail"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  )
}

function KpiCard({ label, value, icon, sub, valueClass = 'text-on-surface', iconWrapClass = 'bg-surface-container text-primary' }) {
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-soft border border-white/50 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-on-surface-variant font-medium">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconWrapClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-4xl font-bold ${valueClass}`}>{value}</span>
        {sub && <span className="text-on-surface-variant text-sm font-medium mb-1 pb-1">{sub}</span>}
      </div>
    </div>
  )
}
