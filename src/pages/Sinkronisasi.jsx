import { useState } from 'react'
import AppShell from '../components/AppShell'
import { synchronize } from '../api/sync'
import { useToast } from '../components/Toast'

// Static placeholder queue — see api/sync.js for context. This app runs in
// online-only mode for now, so there is no real local (offline) queue yet.
const placeholderQueue = [
  { id: 1, initial: 'D', name: 'D', time: 'Hari ini, 10:30' },
  { id: 2, initial: 'E', name: 'E', time: 'Hari ini, 09:15' },
  { id: 3, initial: 'F', name: 'F', time: 'Kemarin, 16:45' },
  { id: 4, initial: 'G', name: 'G', time: 'Kemarin, 15:20' },
]

export default function Sinkronisasi() {
  const [syncing, setSyncing] = useState(false)
  const [lastSyncMessage, setLastSyncMessage] = useState('')
  const { showToast } = useToast()

  async function handleSync() {
    setSyncing(true)
    try {
      // No offline queue is implemented yet, so we call the endpoint with an
      // empty payload purely to confirm connectivity/auth with the server.
      const res = await synchronize({})
      setLastSyncMessage(res.data?.message || 'Sinkronisasi berhasil')
      showToast(res.data?.message || 'Sinkronisasi berhasil')
    } catch (err) {
      showToast(err.response?.data?.message || 'Sinkronisasi gagal, periksa koneksi Anda', 'error')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <AppShell
      searchValue=""
      onSearchChange={undefined}
      breadcrumb={<span className="font-bold text-primary">Sinkronisasi</span>}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-on-surface">Sinkronisasi Data</h2>
          <p className="text-on-surface-variant max-w-2xl">
            Pastikan semua data terunggah ke pusat untuk pemantauan wilayah yang akurat.
          </p>
        </div>

        <section className="mb-10">
          <div className="bg-white rounded-xl shadow-soft p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-surface-container-high relative overflow-hidden">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[48px]">cloud_upload</span>
              </div>
              <div>
                <h3 className="text-xl text-primary font-bold">
                  {placeholderQueue.length} Data Anak Belum Sinkron
                </h3>
                <p className="flex items-center gap-2 text-on-surface text-sm">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  {lastSyncMessage || 'Belum ada sinkronisasi pada sesi ini.'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-8 py-4 bg-primary text-white rounded-lg font-bold text-lg flex items-center gap-3 hover:bg-opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-60"
            >
              <span className={`material-symbols-outlined ${syncing ? 'animate-spin' : ''}`}>
                {syncing ? 'sync' : 'refresh'}
              </span>
              {syncing ? 'Menghubungkan...' : 'Sinkronkan Sekarang'}
            </button>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-bold text-on-surface">Antrean Lokal</h3>
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
              {placeholderQueue.length}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mb-4">
            Contoh tampilan — penyimpanan offline belum diimplementasikan pada build ini.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {placeholderQueue.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-xl shadow-soft border border-surface-container-high hover:border-primary-container transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold text-xl">
                    {item.initial}
                  </div>
                  <span className="material-symbols-outlined text-primary-fixed-dim p-2">
                    pending_actions
                  </span>
                </div>
                <h4 className="text-body-lg font-bold text-on-surface truncate">{item.name}</h4>
                <div className="flex flex-col gap-3 mt-2">
                  <div className="flex items-center gap-2 text-xs text-on-background">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    {item.time}
                  </div>
                  <div className="inline-flex items-center justify-center py-1.5 px-3 bg-surface-container text-[10px] font-bold rounded-md uppercase tracking-wider text-primary w-fit">
                    Tersimpan di Perangkat
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="bg-primary rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-lg">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm">
            <span className="material-symbols-outlined text-white text-[40px]">lightbulb</span>
          </div>
          <div className="flex-grow text-center md:text-left">
            <h4 className="text-white font-bold text-xl mb-2">Tips Sinkronisasi</h4>
            <p className="text-primary-fixed max-w-2xl">
              Untuk pengalaman yang lebih stabil dan hemat kuota data, kami menyarankan Anda
              melakukan sinkronisasi saat terhubung dengan jaringan Wi-Fi di Posyandu atau
              Puskesmas terdekat.
            </p>
          </div>
        </footer>
      </div>
    </AppShell>
  )
}
