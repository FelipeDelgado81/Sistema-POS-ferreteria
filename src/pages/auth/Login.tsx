import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@ferresys.cl');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-asr-primary-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 text-center bg-asr-background border-b border-asr-border">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-asr-primary mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-asr-text tracking-tight">
            Bienvenido a <span className="text-asr-primary">Ferretería ASR</span>
          </h1>
          <p className="text-asr-muted mt-2 text-sm">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-asr-text mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-asr-muted" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-asr-border rounded-lg focus:ring-2 focus:ring-asr-primary focus:border-asr-primary outline-none transition-colors"
                  placeholder="ejemplo@ferreteria.cl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-asr-text mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-asr-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-asr-border rounded-lg focus:ring-2 focus:ring-asr-primary focus:border-asr-primary outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-asr-primary hover:bg-asr-primary-dark text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
