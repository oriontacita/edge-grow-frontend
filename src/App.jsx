import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DataAnak from './pages/DataAnak'
import DetailAnak from './pages/DetailAnak'
import ToddlerForm from './pages/ToddlerForm'
import MeasurementForm from './pages/MeasurementForm'
import Hasil from './pages/Hasil'
import Sinkronisasi from './pages/Sinkronisasi'
import Settings from './pages/Settings'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/data-anak" element={<DataAnak />} />
          <Route path="/data-anak/tambah" element={<ToddlerForm />} />
          <Route path="/data-anak/:toddlerId" element={<DetailAnak />} />
          <Route path="/data-anak/:toddlerId/edit" element={<ToddlerForm />} />
          <Route path="/data-anak/:toddlerId/ukur/tambah" element={<MeasurementForm />} />

          <Route path="/ukur/:measurementId/edit" element={<MeasurementForm />} />
          <Route path="/hasil/:measurementId" element={<Hasil />} />

          <Route path="/sinkronisasi" element={<Sinkronisasi />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ToastProvider>
  )
}
