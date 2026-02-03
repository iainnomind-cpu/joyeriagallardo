import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, ArrowLeft } from 'lucide-react';
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
        setError(`Credenciales incorrectas. Intentos restantes: ${MAX_ATTEMPTS - newAttempts}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockedUntil && lockedUntil > Date.now();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center p-4">
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 transition-colors"
        title="Volver a la tienda"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-blue-600 p-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <Lock size={48} />
          </div>
          <h1 className="text-3xl font-bold text-center">Perlas AC</h1>
          <p className="text-center text-pink-100 mt-2">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLocked || loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="admin@gallardojoyeria.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLocked || loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg outline-none focus:border-pink-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked || loading}
            className="w-full bg-gradient-to-r from-pink-500 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-pink-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Verificando...' : isLocked ? `Bloqueado (${getRemainingLockoutTime()})` : 'Iniciar Sesión'}
          </button>

          {attempts > 0 && attempts < MAX_ATTEMPTS && !isLocked && (
            <p className="text-center text-sm text-gray-600">
              Intentos fallidos: {attempts}/{MAX_ATTEMPTS}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
