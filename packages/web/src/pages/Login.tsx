import { useState } from 'react';
import { auth, setToken } from '../lib/api';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await auth.login(username, password);
      setToken(res.data.token);
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-discord-bg">
      <div className="bg-discord-card p-8 rounded-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">CID BOT</h1>
          <p className="text-discord-muted mt-1">Panel de Administracion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-discord-danger/20 border border-discord-danger text-discord-danger p-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-discord-muted mb-1">Usuario</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white focus:outline-none focus:border-discord-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-discord-muted mb-1">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white focus:outline-none focus:border-discord-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-discord-primary text-white rounded font-medium hover:opacity-90 disabled:opacity-50 transition"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesion'}
          </button>
        </form>
      </div>
    </div>
  );
}
