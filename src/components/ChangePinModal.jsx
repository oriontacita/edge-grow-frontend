import { useState } from 'react'
import Modal from './Modal.jsx'

export default function ChangePinModal({ isOpen, onClose, onSave, saving, error }) {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [localError, setLocalError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (pin !== confirmPin) {
      setLocalError('PIN dan konfirmasi PIN tidak sama')
      return
    }
    setLocalError('')
    onSave(pin)
  }

  return (
    <Modal title="Ubah PIN" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            PIN Baru
          </label>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required
            minLength={6}
            maxLength={6}
            className="min-h-[44px] w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-bold tracking-[0.5em] text-on-surface outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Konfirmasi PIN
          </label>
          <input
            type="password"
            inputMode="numeric"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            required
            minLength={6}
            maxLength={6}
            className="min-h-[44px] w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-bold tracking-[0.5em] text-on-surface outline-none focus:border-primary"
          />
        </div>

        {(localError || error) && (
          <p className="text-xs font-medium text-error">{localError || error}</p>
        )}

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
