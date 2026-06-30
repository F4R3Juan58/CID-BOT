import { useEffect, useState } from 'react';
import { logs } from '../lib/api';
import { ScrollText, Key } from 'lucide-react';

export default function Logs() {
  const [orderLogs, setOrderLogs] = useState<any[]>([]);
  const [keyLogs, setKeyLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<'orders' | 'keys'>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([logs.orders(), logs.keys()]).then(([o, k]) => {
      setOrderLogs(o.data);
      setKeyLogs(k.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-discord-muted">Cargando...</div>;

  const data = tab === 'orders' ? orderLogs : keyLogs;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Logs</h2>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition ${
            tab === 'orders' ? 'bg-discord-primary text-white' : 'bg-discord-card text-discord-muted hover:text-white'
          }`}
        >
          <ScrollText size={16} /> Ventas
        </button>
        <button
          onClick={() => setTab('keys')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition ${
            tab === 'keys' ? 'bg-discord-primary text-white' : 'bg-discord-card text-discord-muted hover:text-white'
          }`}
        >
          <Key size={16} /> Keys
        </button>
      </div>

      <div className="bg-discord-card rounded-lg overflow-hidden">
        <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
          {tab === 'orders' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-discord-hover text-discord-muted text-left sticky top-0 bg-discord-card">
                  <th className="p-3">Usuario</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Monto</th>
                  <th className="p-3">Key</th>
                  <th className="p-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.map((o: any) => (
                  <tr key={o.id} className="border-b border-discord-hover">
                    <td className="p-3 text-white">{o.discordUsername}</td>
                    <td className="p-3 text-discord-text">{o.product?.name || 'N/A'}</td>
                    <td className="p-3 text-discord-success">${o.amount.toFixed(2)}</td>
                    <td className="p-3 text-discord-muted font-mono text-xs">
                      {o.key?.code ? `...${o.key.code.slice(-4)}` : 'N/A'}
                    </td>
                    <td className="p-3 text-discord-muted text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-discord-hover text-discord-muted text-left sticky top-0 bg-discord-card">
                  <th className="p-3">Codigo</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Fecha Uso</th>
                </tr>
              </thead>
              <tbody>
                {data.map((k: any) => (
                  <tr key={k.id} className="border-b border-discord-hover">
                    <td className="p-3 text-discord-muted font-mono text-xs">...{k.code.slice(-4)}</td>
                    <td className="p-3">
                      <span className={`text-xs ${k.status === 'sold' ? 'text-discord-success' : 'text-discord-danger'}`}>
                        {k.status === 'sold' ? 'Vendida' : 'Revocada'}
                      </span>
                    </td>
                    <td className="p-3 text-discord-muted text-xs">{k.usedAt ? new Date(k.usedAt).toLocaleString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {data.length === 0 && <p className="p-6 text-center text-discord-muted">No hay registros</p>}
        </div>
      </div>
    </div>
  );
}
