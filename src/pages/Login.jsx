import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/dashboard'
      navigate(redirectTo, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.key >= '0' && e.key <= '9') appendPin(e.key)
      if (e.key === 'Backspace') backspacePin()
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin])

  function appendPin(digit) {
    setPin((prev) => (prev.length < 6 ? prev + digit : prev))
  }

  function backspacePin() {
    setPin((prev) => prev.slice(0, -1))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Username wajib diisi')
      return
    }
    if (pin.length < 4) {
      setError('PIN minimal 4 digit')
      return
    }

    setLoading(true)
    try {
      await login(username.trim(), pin)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err.response?.data?.message || 'Username atau PIN salah'
      setError(message)
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4 text-on-surface">
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-fixed rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-80 h-80 bg-secondary-fixed rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 w-64 h-64 bg-surface-container-highest rounded-full blur-3xl" />
      </div>

      <main className="relative w-full max-w-md z-10">
        <form
          onSubmit={handleSubmit}
          className="bg-surface rounded-2xl soft-shadow p-8 flex flex-col items-center"
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white font-display-lg font-bold text-3xl mb-4">
              P
            </div>
            <h1 className="font-headline-md text-2xl font-extrabold text-primary">PITA</h1>
            <p className="text-on-surface-variant mt-1 text-sm">
              Pemantauan Tumbuh Kembang Anak
            </p>
          </div>

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold px-1 text-on-surface block" htmlFor="login-username">
                Username
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  person
                </span>
                <input
                  id="login-username"
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-on-surface"
                  placeholder="Masukkan username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold px-1 text-on-surface block" htmlFor="login-pin-display">
                PIN Keamanan
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                  lock
                </span>
                <input
                  id="login-pin-display"
                  className={`w-full pl-10 pr-4 py-3 bg-surface-container-low border rounded-lg outline-none transition-all text-on-surface tracking-[0.5em] text-center ${
                    pin.length > 0 ? 'border-primary' : 'border-outline-variant'
                  }`}
                  maxLength={6}
                  placeholder="••••••"
                  readOnly
                  type="password"
                  value={pin}
                />
              </div>
            </div>

            {error && (
              <p className="text-error text-sm font-medium text-center" role="alert">
                {error}
              </p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => appendPin(n)}
                  className="keypad-button h-14 rounded-xl bg-surface-container-highest font-display-lg text-on-surface flex items-center justify-center transition-all hover:bg-surface-variant border border-outline-variant/30"
                >
                  {n}
                </button>
              ))}
              <div className="h-14" />
              <button
                type="button"
                onClick={() => appendPin('0')}
                className="keypad-button h-14 rounded-xl bg-surface-container-highest font-display-lg text-on-surface flex items-center justify-center transition-all hover:bg-surface-variant border border-outline-variant/30"
              >
                0
              </button>
              <button
                type="button"
                aria-label="Hapus digit terakhir"
                onClick={backspacePin}
                className="keypad-button h-14 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center transition-all hover:bg-surface-variant border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[28px]">backspace</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-primary text-white font-bold py-4 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-60"
            >
              {loading ? 'Memproses...' : 'Masuk'}
              {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
            </button>
          </div>
        </form>
      </main>

      <footer className="mt-6 text-center text-xs text-on-surface-variant tracking-wider">
        <p className="font-medium">ORIONEDGEGROW — GEMASTIK 2026 | UNUSA</p>
      </footer>
    </div>
  )
}
