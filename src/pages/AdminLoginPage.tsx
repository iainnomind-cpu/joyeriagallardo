import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Diamond } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 10 * 1000;

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin-perlas-2024/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const storedAttempts = localStorage.getItem('admin_login_attempts');
    const storedLockout = localStorage.getItem('admin_lockout_until');

    if (storedAttempts) {
      setAttempts(parseInt(storedAttempts, 10));
    }

    if (storedLockout) {
      const lockoutTime = parseInt(storedLockout, 10);
      if (lockoutTime > Date.now()) {
        setLockedUntil(lockoutTime);
      } else {
        localStorage.removeItem('admin_lockout_until');
        localStorage.removeItem('admin_login_attempts');
        setAttempts(0);
      }
    }
  }, []);

  useEffect(() => {
    if (lockedUntil && lockedUntil > Date.now()) {
      const timer = setInterval(() => {
        if (Date.now() >= lockedUntil) {
          setLockedUntil(null);
          setAttempts(0);
          localStorage.removeItem('admin_lockout_until');
          localStorage.removeItem('admin_login_attempts');
          setError('');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockedUntil]);

  const getRemainingLockoutTime = () => {
    if (!lockedUntil) return '';
    const remaining = Math.ceil((lockedUntil - Date.now()) / 1000 / 60);
    return `${remaining} minuto${remaining !== 1 ? 's' : ''}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockedUntil && lockedUntil > Date.now()) {
      setError(`Demasiados intentos fallidos. Intenta de nuevo en ${getRemainingLockoutTime()}.`);
      return;
    }

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      localStorage.removeItem('admin_login_attempts');
      localStorage.removeItem('admin_lockout_until');
      navigate('/admin-perlas-2024/dashboard', { replace: true });
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('admin_login_attempts', newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_DURATION;
        setLockedUntil(lockoutTime);
        localStorage.setItem('admin_lockout_until', lockoutTime.toString());
        setError(`Demasiados intentos fallidos. Bloqueado por ${LOCKOUT_DURATION / 60000} minutos.`);
      } else {
        const message = err instanceof Error ? err.message : 'Credenciales incorrectas';
        if (message.includes('Invalid login credentials') || message.includes('Email not confirmed')) {
          setError(`Credenciales incorrectas. Intentos restantes: ${MAX_ATTEMPTS - newAttempts}`);
        } else {
          setError(message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockedUntil && lockedUntil > Date.now();

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-stone-500 hover:text-stone-300 transition-colors flex items-center gap-2"
        title="Volver a la tienda"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Volver a la tienda</span>
      </button>

      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-stone-100 p-8 border-b border-stone-200 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm mb-4 text-amber-600">
            <Diamond size={24} />
          </div>
          <h1 className="text-2xl font-serif text-stone-900">Joyería Gallardo</h1>
          <p className="text-stone-500 text-sm mt-1">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
              Email Corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLocked || loading}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition-all disabled:opacity-50"
              placeholder="admin@gallardojoyeria.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLocked || loading}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded text-stone-900 outline-none focus:border-stone-400 focus:bg-white transition-all disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded p-4 flex items-start gap-3">
              <AlertCircle className="text-red-800 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked || loading}
            className="w-full bg-stone-900 text-white py-4 rounded font-medium tracking-wide hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? 'Verificando...' : isLocked ? `Bloqueado (${getRemainingLockoutTime()})` : 'Iniciar Sesión'}
          </button>

          {attempts > 0 && attempts < MAX_ATTEMPTS && !isLocked && (
            <p className="text-center text-xs text-stone-400">
              Intentos fallidos: {attempts}/{MAX_ATTEMPTS}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

