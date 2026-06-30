import { useEffect, useState } from 'react';
import { customers } from '../lib/api';
import { Search } from 'lucide-react';

interface Customer {
  id: string;
  discordUsername: string;
  discordUserId: string;
  totalSpent: number;
  verified: boolean;
  createdAt: string;
}

export default function Customers() {
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    const res = await customers.list(search || undefined);
    setList(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="text-discord-muted">Cargando...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Clientes</h2>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-discord-muted" />
        <input
          className="w-full max-w-md pl-10 pr-3 py-2 bg-discord-card border border-discord-hover rounded text-white text-sm"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
      </div>

      <div className="bg-discord-card rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-discord-hover text-discord-muted text-left">
              <th className="p-3">Usuario</th>
              <th className="p-3">Discord ID</th>
              <th className="p-3">Total Gastado</th>
              <th className="p-3">Verificado</th>
              <th className="p-3">Registro</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-discord-hover">
                <td className="p-3 text-white">{c.discordUsername}</td>
                <td className="p-3 text-discord-muted text-xs">{c.discordUserId}</td>
                <td className="p-3 text-discord-success">${c.totalSpent.toFixed(2)}</td>
                <td className="p-3">{c.verified ? '✅' : '❌'}</td>
                <td className="p-3 text-discord-muted text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-discord-muted">No hay clientes</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
