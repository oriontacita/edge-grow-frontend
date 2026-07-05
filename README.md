# PITA — Pemantauan Tumbuh Kembang Anak (React + Vite)

Konversi dari prototipe statis `PITA_app.html` menjadi aplikasi React yang
terhubung ke API sungguhan, sesuai `apidocs.md`.

## Stack

- **Vite** — build tool & dev server
- **React 18** — UI library
- **React Router v6** — routing (`createBrowserRouter`-style nested routes)
- **Tailwind CSS v4** — styling (via `@tailwindcss/vite`, konfigurasi tema di `src/index.css`)
- **Axios** — HTTP client, dengan interceptor `Authorization: Bearer <token>`

## Menjalankan Project

```bash
npm install
cp .env.example .env   # sesuaikan VITE_API_BASE_URL dengan backend Anda
npm run dev
```

Build produksi:

```bash
npm run build
npm run preview
```

## Struktur Folder

```
src/
  api/            # satu file per resource, mengikuti apidocs.md
    axiosClient.js   # instance axios + interceptor token & 401
    auth.js
    dashboard.js
    toddlers.js
    measurements.js
    sync.js
  context/
    AuthContext.jsx  # menyimpan token & username di localStorage
  components/
    AppShell.jsx     # sidebar + topbar + content wrapper (dipakai semua halaman)
    Sidebar.jsx
    TopBar.jsx
    StatusBadge.jsx
    Toast.jsx        # notifikasi sukses/gagal
    ConfirmDialog.jsx
    ProtectedRoute.jsx
  pages/
    Login.jsx           # /login
    Dashboard.jsx        # /dashboard
    DataAnak.jsx          # /data-anak (list balita)
    DetailAnak.jsx         # /data-anak/:toddlerId
    ToddlerForm.jsx         # /data-anak/tambah, /data-anak/:toddlerId/edit
    MeasurementForm.jsx      # /data-anak/:toddlerId/ukur/tambah, /ukur/:measurementId/edit
    Hasil.jsx                 # /hasil/:measurementId
    Sinkronisasi.jsx           # /sinkronisasi
  utils/
    format.js        # umur, tanggal, label status
    latestStatus.js  # helper mengambil status pengukuran terakhir seorang balita
```

## Autentikasi

Login mengirim `{ username, pin }` ke `POST /auth/login`. Token yang
dikembalikan disimpan di `localStorage` (`pita_token`) dan otomatis
dilampirkan sebagai header `Authorization: Bearer <token>` di setiap request
melalui `axiosClient`. Jika server membalas `401`, sesi otomatis dihapus dan
pengguna diarahkan kembali ke halaman login.

> Catatan: API tidak mengembalikan profil user setelah login (hanya token),
> jadi nama yang tampil di sidebar (mis. "Kader X") diambil dari username
> yang diketik saat login, bukan dari endpoint profil.

## Keputusan & Keterbatasan (sesuai kesepakatan)

1. **Halaman**: hanya halaman yang sudah ada di `PITA_app.html` yang dibangun
   (Login, Dashboard, Data Anak, Detail Anak, Tambah/Edit Anak,
   Tambah/Edit Pengukuran, Hasil, Sinkronisasi). Menu **Pengaturan** di
   sidebar sengaja dinonaktifkan (`cursor-not-allowed`) karena API
   `GET/PUT /settings/{user_id}` dan manajemen `Users` belum dibuatkan
   halamannya di build ini.
2. **State management**: axios biasa + `useState`/`useEffect` (tanpa React
   Query/SWR), sesuai preferensi yang dipilih.
3. **Mode Sinkronisasi**: **online-only**. Tombol "Sinkronkan Sekarang" pada
   halaman `/sinkronisasi` benar-benar memanggil `POST /api/syncronize`,
   tetapi kartu "Antrean Lokal" masih berupa **data statis/placeholder** —
   belum ada penyimpanan offline (IndexedDB/localStorage queue) yang
   sesungguhnya. Ini bisa jadi pengembangan lanjutan.
4. **Status gizi (Normal/Risiko/Stunting)**: endpoint `GET /dashboard` dan
   `GET /toddlers` tidak menyertakan status gizi terbaru per balita —
   hanya `GET /measurements/{id}/detail` yang punya `weight_status` /
   `length_status`. Untuk menampilkan badge status di daftar/dasbor,
   aplikasi melakukan lookup tambahan (`utils/latestStatus.js`): ambil
   daftar pengukuran → ambil pengukuran terbaru → ambil detailnya. Ini
   cukup untuk skala posyandu biasa, tapi bisa lambat bila data sangat
   banyak (Dashboard membatasi lookup ke 24 balita pertama). Idealnya
   backend menyediakan field status langsung di kedua endpoint tersebut.
5. **Halaman Hasil**: kartu status gizi (badge, berat/panjang, ASI) berasal
   dari data API sungguhan. Bagian **grafik Z-score WHO, breakdown
   probabilitas, dan rekomendasi menu pangan lokal** masih berupa konten
   ilustratif/statis (diturunkan dari desain asli) karena API belum
   memiliki endpoint prediksi/rekomendasi menu. Tombol "Export PDF" juga
   belum diimplementasikan.
6. **ID pengukuran baru**: `POST /toddlers/{id}/measurements/add` hanya
   mengembalikan `{ success, message }` tanpa id record baru. Setelah
   submit berhasil, aplikasi mengambil ulang daftar pengukuran balita
   tersebut dan memilih yang paling baru untuk diarahkan ke halaman Hasil.
7. **Grafik pertumbuhan** di halaman Detail Anak digambar langsung dari data
   `current_weight` riwayat pengukuran (SVG sederhana tanpa library chart
   tambahan), bukan lagi kurva statis seperti di HTML asli.
8. **Paginasi** pada Data Anak dilakukan di sisi client (API tidak
   menyediakan parameter halaman/limit, hanya filter `gender`).

## Endpoint yang digunakan

Lihat `src/api/*.js` — setiap fungsi memetakan langsung ke endpoint di
`apidocs.md` (auth, dashboard, toddlers, measurements, syncronize).
