import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { getToddler } from '../api/toddlers'
import {
  createMeasurement,
  updateMeasurement,
  getMeasurementDetail,
  getMeasurementsByToddler,
} from '../api/measurements'
import { formatAge, genderLabel } from '../utils/format'
import { useToast } from '../components/Toast'

export default function MeasurementForm() {
  const { toddlerId: toddlerIdParam, measurementId } = useParams()
  const isEdit = Boolean(measurementId)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [toddler, setToddler] = useState(null)
  const [toddlerId, setToddlerId] = useState(toddlerIdParam || null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [weight, setWeight] = useState('')
  const [length, setLength] = useState('')
  const [breastfeeding, setBreastfeeding] = useState('yes')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    async function load() {
      try {
        if (isEdit) {
          const detailRes = await getMeasurementDetail(measurementId)
          const m = detailRes.data?.data?.measurement
          if (m) {
            setToddlerId(m.toddler_id)
            setDate(m.measurement_date)
            setWeight(m.current_weight ?? '')
            setLength(m.current_length ?? '')
            setBreastfeeding(m.breastfeeding || 'yes')
            const toddlerRes = await getToddler(m.toddler_id)
            setToddler(toddlerRes.data?.data?.toddler || null)
          }
        } else if (toddlerIdParam) {
          const toddlerRes = await getToddler(toddlerIdParam)
          setToddler(toddlerRes.data?.data?.toddler || null)
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat data', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurementId, toddlerIdParam])

  function validate() {
    const e = {}
    if (!date) e.date = 'Tanggal wajib diisi'
    if (weight === '' || Number(weight) <= 0) e.weight = 'Berat badan wajib diisi'
    if (length === '' || Number(length) <= 0) e.length = 'Panjang badan wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      measurement_date: date,
      current_weight: Number(weight),
      current_length: Number(length),
      breastfeeding,
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateMeasurement(measurementId, payload)
        showToast('Data pengukuran berhasil diperbarui')
        navigate(`/hasil/${measurementId}`)
      } else {
        await createMeasurement(toddlerId, payload)
        showToast('Data pengukuran berhasil disimpan')
        // The create endpoint does not return the new measurement's id
        // (see apidocs.md), so we re-fetch the list and pick the most
        // recently created record to route to the results page.
        const listRes = await getMeasurementsByToddler(toddlerId)
        const list = listRes.data?.data?.measurements || []
        const latest = [...list].sort(
          (a, b) => new Date(b.created_at || b.measurement_date) - new Date(a.created_at || a.measurement_date),
        )[0]
        if (latest) {
          navigate(`/hasil/${latest.id}`)
        } else {
          navigate(`/data-anak/${toddlerId}`)
        }
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) setErrors(apiErrors)
      showToast(err.response?.data?.message || 'Gagal menyimpan pengukuran', 'error')
    } finally {
      setSaving(false)
    }
  }

  const backTarget = isEdit ? `/data-anak/${toddlerId || ''}` : `/data-anak/${toddlerIdParam}`

  return (
    <AppShell
      breadcrumb={
        <>
          <button className="hover:text-primary" onClick={() => navigate('/data-anak')}>
            Data Anak
          </button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-bold">
            {isEdit ? 'Edit Pengukuran' : 'Tambah Pengukuran'}
          </span>
        </>
      }
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface mb-6">
          {isEdit ? 'Edit Data Pengukuran' : 'Tambah Pengukuran Baru'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-sm p-6 md:p-8 border border-surface-container">
            {loading ? (
              <div className="p-10 text-center text-on-surface-variant">Memuat data...</div>
            ) : (
              <>
                {toddler && (
                  <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant shadow-sm flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-3xl text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        face
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-on-surface">
                        {toddler.toddler_full_name}
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        {genderLabel(toddler.gender)} • {formatAge(toddler.date_of_birth)}
                      </p>
                    </div>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface-variant">
                        Tanggal Pengukuran
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                          calendar_today
                        </span>
                        <input
                          className="w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                      {errors.date && <p className="text-error text-xs font-medium">{errors.date}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface-variant">
                        Usia Saat Ini
                      </label>
                      <div className="relative">
                        <input
                          className="w-full pl-4 pr-16 py-3 bg-surface-container border border-outline-variant rounded-lg text-on-surface-variant"
                          value={toddler ? formatAge(toddler.date_of_birth) : '-'}
                          readOnly
                          disabled
                        />
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        Dihitung otomatis dari tanggal lahir.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface-variant">
                        Berat Badan (kg)
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                          scale
                        </span>
                        <input
                          className="w-full pl-10 pr-12 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                          placeholder="0.00"
                          step="0.01"
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">
                          kg
                        </span>
                      </div>
                      {errors.weight && (
                        <p className="text-error text-xs font-medium">{errors.weight}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-on-surface-variant">
                        Panjang Badan (cm)
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                          straighten
                        </span>
                        <input
                          className="w-full pl-10 pr-12 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                          placeholder="0.0"
                          step="0.1"
                          type="number"
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">
                          cm
                        </span>
                      </div>
                      {errors.length && (
                        <p className="text-error text-xs font-medium">{errors.length}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-on-surface-variant">
                      Pemberian ASI Dilanjutkan?
                    </label>
                    <div className="flex gap-4">
                      {[
                        { value: 'yes', label: 'Ya', icon: 'check_circle' },
                        { value: 'no', label: 'Tidak', icon: 'cancel' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setBreastfeeding(opt.value)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg border-2 transition-all font-bold ${
                            breastfeeding === opt.value
                              ? 'border-primary bg-surface-container text-primary'
                              : 'border-outline-variant text-on-surface-variant hover:border-primary hover:bg-surface-container'
                          }`}
                        >
                          <span className="material-symbols-outlined">{opt.icon}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 flex flex-col md:flex-row-reverse gap-4 items-center">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full md:w-auto min-w-[200px] h-12 bg-primary hover:bg-primary-container text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-60"
                    >
                      {saving ? 'Menyimpan...' : 'Analisis Sekarang'}
                    </button>
                    <button
                      type="button"
                      className="w-full md:w-auto px-8 py-3 text-on-surface-variant font-bold hover:text-primary transition-colors"
                      onClick={() => navigate(backTarget)}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Guidance column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container-high rounded-xl overflow-hidden shadow-sm border border-outline-variant">
              <div className="p-4 bg-primary text-white flex items-center gap-2">
                <span className="material-symbols-outlined">lightbulb</span>
                <span className="font-bold">Panduan Pengukuran</span>
              </div>
              <div className="p-6 space-y-4">
                {[
                  'Pastikan anak melepas alas kaki dan jaket sebelum ditimbang.',
                  'Posisi mata pengukur sejajar dengan angka pada alat ukur panjang badan.',
                  'Lakukan pengukuran sebanyak dua kali untuk hasil yang lebih akurat.',
                ].map((tip, i) => (
                  <div className="flex gap-4" key={i}>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
