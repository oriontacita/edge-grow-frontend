import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { initialsFromName } from '../utils/format'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/data-anak', label: 'Data Anak', icon: 'child_care' },
  { to: '/sinkronisasi', label: 'Sinkronisasi', icon: 'sync' },
  { to: '/settings', label: 'Pengaturan', icon: 'settings' },
]

export default function Sidebar({ open, onClose }) {
  const { username, logout, village } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface shadow-sm flex flex-col py-6 px-4 z-50 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-display-lg font-bold">
            P
          </div>
          <div>
            <p className="font-headline-md text-primary font-extrabold leading-none">Edge Grow</p>
            <p className="text-[10px] text-on-surface-variant font-medium">Tumbuh Kembang Anak</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-body-md ${
                  isActive
                    ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-low'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-container'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
          {/* Pengaturan: not yet implemented against the API in this build */}
         
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold">
            {initialsFromName(username)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-bold text-sm text-on-surface truncate">{username || 'Kader'}</p>
            <p className="text-xs text-on-surface-variant truncate">{village}</p>
          </div>
          <button
            aria-label="Logout"
            className="text-on-surface-variant hover:text-error transition-colors p-2"
            onClick={logout}
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
