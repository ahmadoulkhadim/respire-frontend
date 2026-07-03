import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-respire-600 via-respire-700 to-respire-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-respire-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
        <div className="relative text-center px-12">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <span className="text-white font-bold text-4xl font-display">R</span>
          </div>
          <h1 className="text-4xl font-bold text-white font-display mb-4">RESPIRE</h1>
          <p className="text-respire-200 text-lg leading-relaxed max-w-md">
            Plateforme de surveillance de la qualité de l'air et de la santé respiratoire
          </p>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            {['🌍', '🌿', '💨'].map((emoji, i) => (
              <div key={i} className="text-4xl bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-gradient-to-br from-respire-500 to-respire-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-respire-500/20">
              <span className="text-white font-bold text-2xl font-display">R</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 font-display">Bienvenue</h2>
            <p className="text-gray-500 mt-2">Connectez-vous à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-3">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-respire-500 focus:ring-4 focus:ring-respire-500/10 transition-all text-gray-900 placeholder-gray-400"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:border-respire-500 focus:ring-4 focus:ring-respire-500/10 transition-all text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-respire-500 to-respire-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-respire-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-respire-600 font-semibold hover:text-respire-700">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
