import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { getToddlers, deleteToddler } from '../api/toddlers'
import { getLatestStatusForToddler } from '../utils/latestStatus'
import { formatAge, genderLabel, initialsFromName } from '../utils/format'
import { useToast } from '../components/Toast'

const PAGE_SIZE = 10

export default function DataAnak() {
  const [toddlers, setToddlers] = useState([])
  const [statusById, setStatusById] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const navigate = useNavigate()
  const { showToast } = useToast()

  async function load() {
    setLoading(true)
    setError('')
    try {
      const params = genderFilter ? { gender: genderFilter } : {}
      const res = await getToddlers(params)
      const list = res.data?.data?.toddlers || []
      setToddlers(list)

      const results = await Promise.all(
        list.map(async (t) => ({ id: t.id, status: await getLatestStatusForToddler(t.id) })),
      )
      const map = {}
      results.forEach((r) => {
        map[r.id] = r.status
      })
      setStatusById(map)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data anak')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genderFilter])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return toddlers
    return toddlers.filter(
      (t) =>
        t.toddler_full_name?.toLowerCase().includes(q) ||
        t.biological_mother_name?.toLowerCase().includes(q),
    )
  }, [toddlers, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteToddler(deleteTarget.id)
      showToast('Data anak berhasil dihapus')
      setDeleteTarget(null)
      load()
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus data anak', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AppShell
      searchValue={search}
      onSearchChange={(v) => {
        setSearch(v)
        setPage(1)
      }}
      searchPlaceholder="Cari nama anak atau ibu..."
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Data Anak</h1>
          <p className="text-on-surface-variant mt-1">
            Manajemen dan pemantauan tumbuh kembang balita terdaftar.
          </p>
        </div>
        <button
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
          onClick={() => navigate('/data-anak/tambah')}
        >
          <span className="material-symbols-outlined">person_add</span>
          Tambah Anak Baru
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-error-container text-error px-4 py-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-surface rounded-xl shadow-soft border border-outline-variant/30 overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">child_care</span>
            Daftar Balita Terdaftar
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
              Filter:
            </span>
            <select
              className="bg-surface-container border-none text-xs rounded-full py-1.5 px-4 focus:ring-1 focus:ring-primary"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="">Semua</option>
              <option value="male">Laki-laki</option>
              <option value="female">Perempuan</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-on-surface-variant">Memuat data...</div>
        ) : paged.length === 0 ? (
          <div className="p-10 text-center text-on-surface-variant">Tidak ada data ditemukan.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-highest text-on-surface-variant text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Nama Anak</th>
                  <th className="px-6 py-4">Nama Ibu</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Usia</th>
                  <th className="px-6 py-4">Berat/Panjang Lahir</th>
                  <th className="px-6 py-4">Status Terbaru</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-highest text-on-surface">
                {paged.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-xs text-primary">
                          {initialsFromName(t.toddler_full_name)}
                        </div>
                        <span className="font-bold">{t.toddler_full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{t.biological_mother_name}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{genderLabel(t.gender)}</td>
                    <td className="px-6 py-4 text-on-surface-variant">{formatAge(t.date_of_birth)}</td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      {t.birth_weight}kg / {t.birth_length}cm
                    </td>
                    <td className="px-6 py-4">
                      {t.status? t.status : "tidak ada status"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          aria-label="Lihat Detail"
                          title="Detail"
                          className="w-10 h-10 flex items-center justify-center rounded-lg text-primary hover:bg-primary/10 transition-all"
                          onClick={() => navigate(`/data-anak/${t.id}`)}
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button
                          aria-label="Edit Data"
                          title="Edit"
                          className="w-10 h-10 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container transition-all"
                          onClick={() => navigate(`/data-anak/${t.id}/edit`)}
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          aria-label="Hapus Data"
                          title="Hapus"
                          className="w-10 h-10 flex items-center justify-center rounded-lg text-error hover:bg-error-container transition-all"
                          onClick={() => setDeleteTarget(t)}
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

        {!loading && filtered.length > 0 && (
          <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-on-surface-variant">
              Menampilkan <span className="font-bold text-on-surface">{paged.length}</span> dari{' '}
              <span className="font-bold text-on-surface">{filtered.length}</span> balita
            </p>
            <div className="flex items-center gap-1">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-30"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="px-3 text-sm font-bold text-on-surface">
                {page} / {totalPages}
              </span>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-30"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus data anak?"
        message={`Data "${deleteTarget?.toddler_full_name}" beserta riwayat pengukurannya akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </AppShell>
  )
}
