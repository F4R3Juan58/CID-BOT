import { useEffect, useState } from 'react';
import { orders as ordersApi } from '../lib/api';
import { Check, X, Download, Search } from 'lucide-react';

interface Order {
  id: string;
  discordUsername: string;
  product: { name: string } | null;
  amount: number;
  paymentMethod: string;
  status: string;
  resellerCode: string | null;
  key: { code: string } | null;
  createdAt: string;
}

export default function Orders() {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    if (search) params.set('search', search);
    const res = await ordersApi.list(params.toString());
    setOrderList(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const approve = async (id: string) => {
    await ordersApi.approve(id);
    load();
  };

  const reject = async (id: string) => {
    await ordersApi.reject(id);
    load();
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      pending_payment: 'text-discord-warning',
      pending_approval: 'text-discord-primary',
      approved: 'text-discord-success',
      delivered: 'text-discord-success',
      rejected: 'text-discord-danger',
    };
    return map[s] || 'text-discord-muted';
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending_payment: 'Pendiente Pago',
      pending_approval: 'Pendiente Aprob.',
      approved: 'Aprobada',
      delivered: 'Entregada',
      rejected: 'Rechazada',
    };
    return map[s] || s;
  };

  if (loading) return <div className="text-discord-muted">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Ventas / Ordenes</h2>
        <a href={ordersApi.exportCsv()} className="flex items-center gap-2 px-4 py-2 bg-discord-hover text-white rounded hover:bg-discord-primary/20 transition">
          <Download size={16} /> Exportar CSV
        </a>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-discord-muted" />
          <input
            className="w-full pl-10 pr-3 py-2 bg-discord-card border border-discord-hover rounded text-white text-sm"
            placeholder="Buscar por usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
        </div>
        <select
          className="px-3 py-2 bg-discord-card border border-discord-hover rounded text-white text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="pending_payment">Pendiente Pago</option>
          <option value="pending_approval">Pendiente Aprobacion</option>
          <option value="delivered">Entregada</option>
          <option value="rejected">Rechazada</option>
        </select>
      </div>

      <div className="bg-discord-card rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-discord-hover text-discord-muted text-left">
              <th className="p-3">Usuario</th>
              <th className="p-3">Producto</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Metodo</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orderList.map((o) => (
              <tr key={o.id} className="border-b border-discord-hover">
                <td className="p-3 text-white">{o.discordUsername}</td>
                <td className="p-3 text-discord-text">{o.product?.name || 'N/A'}</td>
                <td className="p-3 text-discord-success">${o.amount.toFixed(2)}</td>
                <td className="p-3 text-discord-muted">{o.paymentMethod}</td>
                <td className="p-3">
                  <span className={`text-xs ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                </td>
                <td className="p-3 text-discord-muted text-xs">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="p-3">
                  {o.status === 'pending_approval' && (
                    <div className="flex gap-2">
                      <button onClick={() => approve(o.id)} className="p-1 text-discord-success hover:bg-discord-success/20 rounded"><Check size={16} /></button>
                      <button onClick={() => reject(o.id)} className="p-1 text-discord-danger hover:bg-discord-danger/20 rounded"><X size={16} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {orderList.length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-discord-muted">No hay ordenes</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
