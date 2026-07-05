import { useEffect, useState } from 'react'
import { getSettings, updateSettings } from '../api/settingsApi.js'
import EditProfileModal from '../components/EditProfileModal.jsx'
import ChangePinModal from '../components/ChangePinModal.jsx'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'



// TODO: Ganti dengan user_id yang sebenarnya (misalnya dari decode JWT atau Context)
// const DUMMY_USER_ID = userId

export default function Settings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePin, setShowChangePin] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [toast, setToast] = useState('')
  const { userId } = useAuth()


  useEffect(() => {
    let isMounted = true

    async function fetchSettings() {
      setLoading(true)
      setLoadError('')
      try {
        const data = await getSettings(userId)
        if (isMounted) setUser(data.data.data.user)
      } catch (err) {
        if (isMounted) setLoadError(err.message || 'Gagal memuat data pengaturan')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchSettings()
    return () => {
      isMounted = false
    }
  }, [])

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleSaveProfile(form) {
    setSaving(true)
    setSaveError('')
    try {
      await updateSettings(userId, {
        full_name: form.full_name,
        username: form.username,
        gender: form.gender,
        pin: user.pin,
      })
      setUser((prev) => ({ ...prev, ...form }))
      setShowEditProfile(false)
      showToast('Profil berhasil diperbarui')
    } catch (err) {
      setSaveError(err.message || 'Gagal menyimpan profil')
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePin(newPin) {
    setSaving(true)
    setSaveError('')
    try {
      await updateSettings(DUMMY_USER_ID, {
        full_name: user.full_name,
        username: user.username,
        gender: user.gender,
        pin: newPin,
      })
      setUser((prev) => ({ ...prev, pin: newPin }))
      setShowChangePin(false)
      showToast('PIN berhasil diperbarui')
    } catch (err) {
      setSaveError(err.message || 'Gagal menyimpan PIN')
    } finally {
      setSaving(false)
    }
  }

  // Diperbaiki: Menghapus TOKEN_STORAGE_KEY yang menyebabkan error
  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('village')
    window.location.href = '/login'
  }

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '--'

  return (
    <AppShell
      searchValue=""
      onSearchChange={undefined}
      breadcrumb={<span className="font-bold text-primary">Settings</span>}
    >
      <div className="mx-auto w-full max-w-4xl p-4 pb-24 md:p-8 md:pb-8">
      
      {/* Toast Notification */}
      {toast && (
        <div className="mb-4 rounded-lg bg-secondary-container px-4 py-3 text-sm font-medium text-on-secondary-container">
          {toast}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-on-surface-variant">
          Memuat data...
        </div>
      )}

      {/* Error State */}
      {!loading && loadError && (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-error-container/30 p-8 text-center">
          <span className="material-symbols-outlined text-error">error</span>
          <p className="text-sm text-on-error-container">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Main Settings Content */}
      {!loading && !loadError && user && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          
          {/* Profile Summary Card */}
          <div className="md:col-span-1">
            <div className="card-shadow flex flex-col items-center rounded-xl bg-white p-6 text-center">
              <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-container ring-4 ring-surface-container">
                <span className="font-headline text-2xl font-bold text-white">{initials}</span>
              </div>

              <h2 className="font-headline text-xl font-bold text-on-surface">{user.full_name}</h2>

              <div className="my-4 h-px w-full bg-outline-variant/30"></div>

              <div className="flex w-full flex-col gap-2 text-left">
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">badge</span>
                  <span className="text-xs">
                    {user.role === 'admin' ? 'Admin' : 'Kader'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">wc</span>
                  <span className="text-xs capitalize">{user.gender}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fields & Action Section */}
          <div className="flex flex-col gap-6 md:col-span-2">
            
            {/* Informasi Profil */}
            <div className="card-shadow flex flex-col gap-6 rounded-xl bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-headline text-lg font-bold text-primary">
                  <span className="material-symbols-outlined">person_outline</span>
                  Informasi Profil
                </h3>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Edit Detail
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Field label="Nama Kader" value={user.full_name} />
                <Field label="Username" value={user.username} />
                <Field label="Jenis Kelamin" value={user.gender} className="capitalize" />
                <Field label="Role" value={user.role} className="capitalize" />
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="min-h-[44px] flex-1 rounded-lg bg-primary px-6 py-3 font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 md:flex-none"
                >
                  Ubah Profil
                </button>
              </div>
            </div>

            {/* Keamanan Akun */}
            <div className="card-shadow flex flex-col gap-6 rounded-xl bg-white p-6">
              <h3 className="flex items-center gap-2 font-headline text-lg font-bold text-primary">
                <span className="material-symbols-outlined">security</span>
                Keamanan Akun
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  PIN Akses
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex min-h-[44px] flex-1 items-center rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-bold tracking-[0.5em] text-on-surface">
                    ••••••
                  </div>
                  <button
                    onClick={() => setShowChangePin(true)}
                    className="min-h-[44px] whitespace-nowrap rounded-lg bg-primary px-6 py-3 font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95"
                  >
                    Ubah PIN
                  </button>
                </div>
                <p className="mt-1 text-[10px] italic text-on-surface-variant">
                  *PIN digunakan untuk verifikasi input data baru di Posyandu.
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center justify-between rounded-xl border border-error/20 bg-error-container/30 p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-error/10 p-3 text-error">
                  <span className="material-symbols-outlined">logout</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Keluar Aplikasi</h4>
                  <p className="text-xs text-on-surface-variant">Pastikan semua data sudah sinkron.</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="min-h-[44px] rounded-lg border-2 border-primary-container px-6 py-2.5 font-bold text-primary-container transition-all hover:bg-primary-container hover:text-white"
              >
                Keluar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modals */}
      {user && (
        <>
          <EditProfileModal
            isOpen={showEditProfile}
            onClose={() => {
              setShowEditProfile(false)
              setSaveError('')
            }}
            user={user}
            onSave={handleSaveProfile}
            saving={saving}
            error={saveError}
          />

          <ChangePinModal
            isOpen={showChangePin}
            onClose={() => {
              setShowChangePin(false)
              setSaveError('')
            }}
            onSave={handleSavePin}
            saving={saving}
            error={saveError}
          />
        </>
      )}
      </div>
    </AppShell>
  )
}

// Helper Component untuk Field
function Field({ label, value, className = '' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</label>
      <div
        className={`flex min-h-[44px] w-full items-center rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 font-medium text-on-surface ${className}`}
      >
        {value}
      </div>
    </div>
  )
}