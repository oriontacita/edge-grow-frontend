import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import { getMeasurementDetail } from '../api/measurements'
import { formatDate } from '../utils/format'
import { useToast } from '../components/Toast'

// The API only returns weight_status / length_status per measurement.
// The WHO z-score curves, probability breakdown, and local-food menu below
// are illustrative UI (carried over from the original design) since there
// is no backend endpoint yet returning that level of detail.
const sampleMenu = [
  {
    title: 'Bubur Ikan Patin Kuning',
    tag: 'Menu Utama',
    desc: 'Bubur lembut dari beras lokal dengan suwiran ikan patin sungai yang kaya omega-3 dan DHA untuk pertumbuhan otak.',
    badges: ['Protein Tinggi', 'Zat Besi'],
    time: '25 Menit',
    kcal: '240 kkal',
  },
  {
    title: 'Sayur Bening Kelor & Telur',
    tag: 'Pelengkap',
    desc: 'Daun kelor segar sebagai superfood lokal dipadukan dengan telur rebus untuk asupan kalsium tulang yang optimal.',
    badges: ['Vitamin A', 'Kalsium'],
    time: '15 Menit',
    kcal: '180 kkal',
  },
  {
    title: 'Mousse Tempe Kurma',
    tag: 'Selingan',
    desc: 'Camilan inovatif dari tempe kukus yang dihaluskan dengan kurma, memberikan energi instan dan protein nabati tinggi.',
    badges: ['Protein Nabati', 'Energi'],
    time: '10 Menit',
    kcal: '150 kkal',
  },
]

export default function Hasil() {
  const { measurementId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [measurement, setMeasurement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await getMeasurementDetail(measurementId)
        setMeasurement(res.data?.data?.measurement || null)
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat hasil analisis')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [measurementId])

  if (loading) {
    return (
      <AppShell breadcrumb={<span>Memuat...</span>}>
        <div className="p-10 text-center text-on-surface-variant">Memuat hasil analisis...</div>
      </AppShell>
    )
  }

  if (error || !measurement) {
    return (
      <AppShell breadcrumb={<span>Hasil</span>}>
        <div className="bg-error-container text-error px-4 py-3 rounded-lg text-sm font-medium">
          {error || 'Data pengukuran tidak ditemukan'}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      breadcrumb={
        <>
          <button className="hover:text-primary" onClick={() => navigate('/data-anak')}>
            Data Anak
          </button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-bold">Hasil Analisis</span>
        </>
      }
      contentClassName="p-4 md:p-8 max-w-[1600px] mx-auto w-full pb-28"
    >
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-on-surface">Analisis Kesehatan Anak</h2>
          <p className="text-on-surface-variant">
            {measurement.toddler_name} — diukur pada {formatDate(measurement.measurement_date)}
          </p>
        </div>
        <button
          onClick={() => showToast('Fitur export PDF belum tersedia', 'error')}
          className="flex items-center gap-2 px-6 h-12 bg-primary text-white rounded-lg font-bold transition-transform active:scale-95 shadow-lg"
        >
          <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
          Export PDF
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* Left: hasil prediksi */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="bg-surface rounded-2xl p-6 shadow-soft border border-surface-container-highest">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Hasil Prediksi</h3>
              <StatusBadge status={measurement.weight_status || measurement.length_status} />
            </div>

            <div className="space-y-4 mb-6">
              <StatRow label="Berat Badan" value={`${measurement.current_weight} kg`} />
              <StatRow label="Panjang Badan" value={`${measurement.current_length} cm`} />
              <StatRow label="Usia Saat Ukur" value={`${measurement.current_age} Bulan`} />
              <StatRow
                label="ASI Dilanjutkan"
                value={measurement.breastfeeding === 'yes' ? 'Ya' : 'Tidak'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-surface-container-low rounded-lg p-4">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Status Berat/Umur
                </p>
                <StatusBadge status={measurement.weight_status} />
              </div>
              <div className="bg-surface-container-low rounded-lg p-4">
                <p className="text-xs font-bold text-on-surface-variant uppercase mb-1">
                  Status Panjang/Umur
                </p>
                <StatusBadge status={measurement.length_status} />
              </div>
            </div>
          </div>
        </section>

        {/* Right: rekomendasi menu (illustrative) */}
        {/* <section className="col-span-12 lg:col-span-7 bg-surface rounded-2xl p-6 md:p-8 shadow-soft border border-surface-container-highest flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🥗</span>
              <h3 className="text-xl font-bold">Rekomendasi</h3>
            </div>
            <p className="text-on-surface-variant flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-sm">info</span>
            </p>
          </div>

          <div className="flex-1 space-y-4">
            {sampleMenu.map((item) => (
              <div
                key={item.title}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-surface-container-highest hover:bg-surface-container-low transition-colors"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="font-bold text-lg">{item.title}</h4>
                    <span className="text-xs bg-secondary-fixed text-on-secondary-container px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                      {item.tag}
                    </span>
                  </div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {item.badges.map((b) => (
                      <span
                        key={b}
                        className="text-[10px] font-bold px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium">{item.desc}</p>
                  <div className="mt-3 flex items-center gap-4">
                    <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">timer</span> {item.time}
                    </span>
                    <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">local_fire_department</span>{' '}
                      {item.kcal}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section> */}
      </div>

      <footer className="fixed bottom-0 left-0 md:left-64 right-0 h-20 bg-surface border-t border-surface-container-highest px-4 md:px-8 flex items-center justify-between z-30">
        <button
          className="flex items-center gap-2 px-4 md:px-6 h-11 border-2 border-outline text-on-surface-variant rounded-lg font-bold hover:bg-surface-container transition-all"
          onClick={() => navigate(`/data-anak/${measurement.toddler_id}`)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="hidden sm:inline">Kembali ke Detail Anak</span>
        </button>
        <button
          className="px-4 md:px-8 h-11 bg-secondary text-white rounded-lg font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
          onClick={() => navigate(`/data-anak/${measurement.toddler_id}/ukur/tambah`)}
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span className="hidden sm:inline">Catat Pengukuran Baru</span>
        </button>
      </footer>
    </AppShell>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm border-b border-surface-container-highest pb-2">
      <span className="font-bold text-on-surface-variant">{label}</span>
      <span className="font-bold text-on-surface">{value}</span>
    </div>
  )
}
