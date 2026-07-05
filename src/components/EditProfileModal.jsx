import { useState } from 'react'
import Modal from './Modal.jsx'

export default function EditProfileModal({ isOpen, onClose, user, onSave, saving, error }) {
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    username: user?.username || '',
    gender: user?.gender || 'female',
  })

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal title="Edit Profil" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Nama Kader
          </label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
            className="min-h-[44px] w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-medium text-on-surface outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Username
          </label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="min-h-[44px] w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-medium text-on-surface outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Jenis Kelamin
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="min-h-[44px] w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-medium text-on-surface outline-none focus:border-primary"
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        {error && <p className="text-xs font-medium text-error">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] rounded-lg px-6 py-2.5 font-bold text-on-surface-variant hover:bg-surface-container-high"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="min-h-[44px] rounded-lg bg-primary px-6 py-2.5 font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
