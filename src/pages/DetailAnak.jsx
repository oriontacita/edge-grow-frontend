import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { getToddler } from '../api/toddlers'
import { getMeasurementsByToddler, deleteMeasurement, getMeasurementDetail } from '../api/measurements'
import { formatAge, formatDate, genderLabel } from '../utils/format'
import { useToast } from '../components/Toast'

export default function DetailAnak() {
  const { toddlerId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [toddler, setToddler] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [latestStatus, setLatestStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [toddlerRes, measurementsRes] = await Promise.all([
        getToddler(toddlerId),
        getMeasurementsByToddler(toddlerId),
      ])
      setToddler(toddlerRes.data?.data?.toddler || null)
      const list = measurementsRes.data?.data?.measurements || []
      const sorted = [...list].sort(
        (a, b) => new Date(b.measurement_date) - new Date(a.measurement_date),
      )
      setMeasurements(sorted)

      if (sorted[0]) {
        try {
          const detailRes = await getMeasurementDetail(sorted[0].id)
          setLatestStatus(detailRes.data?.data?.measurement || null)
        } catch {
          setLatestStatus(null)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail anak')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toddlerId])

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteMeasurement(deleteTarget.id)
      showToast('Data pengukuran berhasil dihapus')
      setDeleteTarget(null)
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus pengukuran', 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AppShell breadcrumb={<span>Memuat...</span>}>
        <div className="p-10 text-center text-on-surface-variant">Memuat data...</div>
      </AppShell>
    )
  }

  if (error || !toddler) {
    return (
      <AppShell breadcrumb={<span>Detail Anak</span>}>
        <div className="bg-error-container text-error px-4 py-3 rounded-lg text-sm font-medium">
          {error || 'Data anak tidak ditemukan'}
        </div>
        <button
          className="mt-4 text-primary font-bold flex items-center gap-1"
          onClick={() => navigate('/data-anak')}
        >
          <span className="material-symbols-outlined">arrow_back</span> Kembali ke Data Anak
        </button>
      </AppShell>
    )
  }

  const chronological = [...measurements].sort(
    (a, b) => new Date(a.measurement_date) - new Date(b.measurement_date),
  )

  return (
    <AppShell
      breadcrumb={
        <div className="flex items-center gap-2">
          <button
            aria-label="Kembali"
            onClick={() => navigate('/data-anak')}
            className="hover:bg-surface-container rounded-full p-1.5 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-bold text-primary">Detail Data Anak</span>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Card */}
        <section className="bg-surface rounded-xl p-6 shadow-soft border-l-8 border-primary relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <StatusBadge status={latestStatus?.weight_status || latestStatus?.length_status} />
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center shrink-0 border border-surface-container-highest">
              <span className="material-symbols-outlined text-primary text-5xl">face_3</span>
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-bold text-on-surface tracking-tight">
                {toddler.toddler_full_name}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8 text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person_pin</span>
                  <span className="font-semibold">Ibu: {toddler.biological_mother_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">transgender</span>
                  <span className="font-semibold">
                    Gender: <span className="text-on-surface">{genderLabel(toddler.gender)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  <span className="font-semibold">
                    Lahir:{' '}
                    <span className="text-on-surface">{formatDate(toddler.date_of_birth)}</span> (
                    {formatAge(toddler.date_of_birth)})
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="bg-surface-container-lowest border border-outline-variant px-3 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface-variant">BB Lahir</span>
                  <span className="font-bold text-primary">{toddler.birth_weight} kg</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant px-3 py-2 rounded-lg flex items-center gap-2">
                  <span className="text-xs font-bold text-on-surface-variant">PB Lahir</span>
                  <span className="font-bold text-primary">{toddler.birth_length} cm</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Growth chart */}
        <div className="bg-surface rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-on-surface">Grafik Pertumbuhan Berat Badan</h3>
              <p className="text-on-surface-variant text-sm font-medium">
                Berdasarkan riwayat pengukuran tercatat
              </p>
            </div>
          </div>
          <GrowthChart data={chronological} />
        </div>

        {/* Measurement History */}
        <section className="bg-surface rounded-xl shadow-soft overflow-hidden">
          <div className="p-6 border-b border-surface-container-highest flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-on-surface">Riwayat Pengukuran</h3>
              <p className="text-on-surface-variant text-sm font-medium">
                Data historis pertumbuhan balita
              </p>
            </div>
            <button
              className="bg-primary text-white px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-md"
              onClick={() => navigate(`/data-anak/${toddlerId}/ukur/tambah`)}
            >
              <span className="material-symbols-outlined">add</span>
              <span className="font-bold">Ukur Baru</span>
            </button>
          </div>

          {measurements.length === 0 ? (
            <div className="p-10 text-center text-on-surface-variant">
              Belum ada riwayat pengukuran untuk anak ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-surface-container-highest text-on-surface-variant">
                    <th className="px-6 py-4 font-black">Tanggal Ukur</th>
                    <th className="px-6 py-4 font-black">Usia</th>
                    <th className="px-6 py-4 font-black text-center">BB (kg)</th>
                    <th className="px-6 py-4 font-black text-center">PB (cm)</th>
                    <th className="px-6 py-4 font-black text-center">ASI</th>
                    <th className="px-6 py-4 font-black text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-highest">
                  {measurements.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4 font-bold text-on-surface">
                        {formatDate(m.measurement_date)}
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface-variant">
                        {m.current_age} Bulan
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-on-surface">
                        {m.current_weight}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-on-surface">
                        {m.current_length}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`material-symbols-outlined ${
                            m.breastfeeding === 'yes' ? 'text-status-normal' : 'text-error'
                          }`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {m.breastfeeding === 'yes' ? 'check_circle' : 'cancel'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            aria-label="Lihat hasil analisis"
                            title="Hasil"
                            className="text-primary hover:bg-primary-fixed p-2 rounded-full transition-colors"
                            onClick={() => navigate(`/hasil/${m.id}`)}
                          >
                            <span className="material-symbols-outlined">insights</span>
                          </button>
                          <button
                            aria-label="Edit pengukuran"
                            title="Edit"
                            className="text-primary hover:bg-primary-fixed p-2 rounded-full transition-colors"
                            onClick={() => navigate(`/ukur/${m.id}/edit`)}
                          >
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button
                            aria-label="Hapus pengukuran"
                            title="Hapus"
                            className="text-error hover:bg-error-container p-2 rounded-full transition-colors"
                            onClick={() => setDeleteTarget(m)}
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus data pengukuran?"
        message="Riwayat pengukuran ini akan dihapus permanen."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </AppShell>
  )
}

// A dependency-free line chart driven by real measurement data.
function GrowthChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center bg-surface-container-low rounded-lg text-on-surface-variant text-sm">
        Belum ada data untuk ditampilkan.
      </div>
    )
  }

  const width = 600
  const height = 220
  const padding = 32
  const weights = data.map((d) => d.current_weight)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const range = max - min || 1

  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(data.length - 1, 1)
    const y = height - padding - ((d.current_weight - min) / range) * (height - padding * 2)
    return { x, y, ...d }
  })

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x} ${p.y}`).join(' ')

  return (
    <div className="w-full bg-surface-container-low rounded-lg p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="#5f003a" strokeWidth="3" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#5f003a" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-on-surface-variant mt-2 px-2">
        {points.map((p, i) => (
          <span key={i}>{formatDate(p.measurement_date)}</span>
        ))}
      </div>
    </div>
  )
}
