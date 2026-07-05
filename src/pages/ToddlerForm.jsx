import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { createToddler, updateToddler, getToddler } from '../api/toddlers'
import { useToast } from '../components/Toast'

const emptyForm = {
  toddler_full_name: '',
  biological_mother_name: '',
  date_of_birth: '',
  gender: 'male',
  birth_weight: '',
  birth_length: '',
}

export default function ToddlerForm() {
  const { toddlerId } = useParams()
  const isEdit = Boolean(toddlerId)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isEdit) return
    async function load() {
      try {
        const res = await getToddler(toddlerId)
        const t = res.data?.data?.toddler
        if (t) {
          setForm({
            toddler_full_name: t.toddler_full_name || '',
            biological_mother_name: t.biological_mother_name || '',
            date_of_birth: t.date_of_birth || '',
            gender: t.gender || 'male',
            birth_weight: t.birth_weight ?? '',
            birth_length: t.birth_length ?? '',
          })
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Gagal memuat data anak', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toddlerId])

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function validate() {
    const e = {}
    if (!form.toddler_full_name.trim()) e.toddler_full_name = 'Nama anak wajib diisi'
    if (!form.biological_mother_name.trim()) e.biological_mother_name = 'Nama ibu wajib diisi'
    if (!form.date_of_birth) e.date_of_birth = 'Tanggal lahir wajib diisi'
    if (form.birth_weight === '' || Number(form.birth_weight) <= 0)
      e.birth_weight = 'Berat lahir wajib diisi'
    if (form.birth_length === '' || Number(form.birth_length) <= 0)
      e.birth_length = 'Panjang lahir wajib diisi'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      ...form,
      birth_weight: Number(form.birth_weight),
      birth_length: Number(form.birth_length),
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateToddler(toddlerId, payload)
        showToast('Data anak berhasil diperbarui')
        navigate(`/data-anak/`)
      } else {
        await createToddler(payload)
        showToast('Data anak berhasil disimpan')
        navigate('/data-anak')
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) setErrors(apiErrors)
      showToast(err.response?.data?.message || 'Gagal menyimpan data anak', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      breadcrumb={
        <>
          <button className="hover:text-primary" onClick={() => navigate('/data-anak')}>
            Data Anak
          </button>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-bold">{isEdit ? 'Edit Anak' : 'Tambah Anak Baru'}</span>
        </>
      }
      contentClassName="p-4 md:p-8 flex justify-center items-start"
    >
      <div className="w-full max-w-2xl bg-surface rounded-xl shadow-soft overflow-hidden border border-surface-container-highest">
        <div className="p-6 md:p-8 bg-surface-container-low border-b border-outline-variant">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[28px]">person_add</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">
                {isEdit ? 'Edit Data Anak' : 'Tambah Anak Baru'}
              </h1>
              <p className="text-on-surface-variant text-sm">
                Lengkapi data bayi untuk mulai pemantauan gizi.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-on-surface-variant">Memuat data...</div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Nama Lengkap Anak"
                icon="child_care"
                className="col-span-full"
                error={errors.toddler_full_name}
              >
                <input
                  className={inputClass}
                  placeholder="Contoh: Ahmad Fauzi"
                  type="text"
                  value={form.toddler_full_name}
                  onChange={(e) => update('toddler_full_name', e.target.value)}
                />
              </Field>

              <Field label="Nama Ibu Kandung" icon="woman" error={errors.biological_mother_name}>
                <input
                  className={inputClass}
                  placeholder="Nama Ibu"
                  type="text"
                  value={form.biological_mother_name}
                  onChange={(e) => update('biological_mother_name', e.target.value)}
                />
              </Field>

              <Field label="Tanggal Lahir" icon="calendar_today" error={errors.date_of_birth}>
                <input
                  className={inputClass}
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => update('date_of_birth', e.target.value)}
                />
              </Field>

              <div className="space-y-2 col-span-full">
                <label className="block text-on-surface font-medium">Jenis Kelamin</label>
                <div className="flex p-1 bg-surface-container-highest rounded-lg">
                  {[
                    { value: 'male', label: 'Laki-laki', icon: 'male' },
                    { value: 'female', label: 'Perempuan', icon: 'female' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => update('gender', opt.value)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md transition-all font-bold ${
                        form.gender === opt.value
                          ? 'bg-surface text-primary shadow-sm'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Berat Lahir (kg)" icon="monitor_weight" error={errors.birth_weight}>
                <input
                  className={`${inputClass} text-right pr-12`}
                  placeholder="0.0"
                  step="0.1"
                  type="number"
                  value={form.birth_weight}
                  onChange={(e) => update('birth_weight', e.target.value)}
                />
              </Field>

              <Field label="Panjang Lahir (cm)" icon="straighten" error={errors.birth_length}>
                <input
                  className={`${inputClass} text-right pr-12`}
                  placeholder="0.0"
                  step="0.1"
                  type="number"
                  value={form.birth_length}
                  onChange={(e) => update('birth_length', e.target.value)}
                />
              </Field>
            </div>

            <div className="bg-surface-container-low rounded-lg p-4 flex gap-3 items-start">
              <span
                className="material-symbols-outlined text-primary font-bold"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
              <p className="text-xs text-on-surface-variant font-medium">
                Pastikan data yang dimasukkan sudah sesuai dengan Kartu Menuju Sehat (KMS) atau
                dokumen kesehatan resmi anak.
              </p>
            </div>

            <div className="pt-4 flex flex-col md:flex-row-reverse gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary text-white font-bold px-8 py-3.5 rounded-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <span className="material-symbols-outlined">save</span>
                {saving ? 'Menyimpan...' : 'Simpan Data Anak'}
              </button>
              <button
                type="button"
                className="flex-1 border-2 border-primary text-primary font-bold px-8 py-3.5 rounded-lg hover:bg-surface-container-highest active:scale-95 transition-all flex items-center justify-center gap-2"
                onClick={() => navigate(isEdit ? `/data-anak/${toddlerId}` : '/data-anak')}
              >
                <span className="material-symbols-outlined">close</span>
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  )
}

const inputClass =
  'w-full pl-10 pr-4 py-3.5 rounded-lg border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all'

function Field({ label, icon, children, className = '', error }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block font-medium text-on-surface">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          {icon}
        </span>
        {children}
      </div>
      {error && <p className="text-error text-xs font-medium">{error}</p>}
    </div>
  )
}
