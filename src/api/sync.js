import axiosClient from './axiosClient'

// POST /api/syncronize
// NOTE: this project runs in online-only mode (see README). This call is
// wired up to the real endpoint, but there is no local offline queue behind
// it yet — the "Antrean Lokal" cards on the Sinkronisasi page are static
// placeholders until an offline-first storage layer (e.g. IndexedDB) is
// implemented.
export function synchronize(payload) {
  return axiosClient.post('/syncronize', payload)
}
