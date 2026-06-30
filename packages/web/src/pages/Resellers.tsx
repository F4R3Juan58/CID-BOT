import { useEffect, useState } from 'react';
import { resellers as resellersApi } from '../lib/api';
import { Plus, Trash2, X } from 'lucide-react';

interface Reseller {
  id: string;
  discordUsername: string;
  code: string;
  commission: number;
  totalSales: number;
  totalCommission: number;
  active: boolean;
}

export default function Resellers() {
  const [list, setList] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ discordUserId: '', discordUsername: '', code: '', commission: 10 });

  const load = async () => {
    const res = await resellersApi.list();
    setList(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    await resellersApi.create(form);
    setShowModal(false);
    setForm({ discordUserId: '', discordUsername: '', code: '', commission: 10 });
    load();
  };

  const toggleActive = async (r: Reseller) => {
    if (r.active) {
      await resellersApi.delete(r.id);
    } else {
      await resellersApi.update(r.id, { active: true });
    }
    load();
  };

  if (loading) return <div className="text-discord-muted">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Resellers</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-discord-primary text-white rounded hover:opacity-90 transition">
          <Plus size={16} /> Nuevo Reseller
        </button>
      </div>

      <div className="bg-discord-card rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-discord-hover text-discord-muted text-left">
              <th className="p-3">Usuario</th>
              <th className="p-3">Codigo</th>
              <th className="p-3">Comision</th>
              <th className="p-3">Ventas</th>
              <th className="p-3">Comision Acum.</th>
              <th className="p-3">Activo</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-b border-discord-hover">
                <td className="p-3 text-white">{r.discordUsername}</td>
                <td className="p-3 text-discord-primary font-mono">{r.code}</td>
                <td className="p-3 text-discord-muted">{r.commission}%</td>
                <td className="p-3 text-discord-text">{r.totalSales}</td>
                <td className="p-3 text-discord-success">${r.totalCommission.toFixed(2)}</td>
                <td className="p-3">
                  <button onClick={() => toggleActive(r)} className={`px-2 py-0.5 rounded text-xs ${r.active ? 'bg-discord-success/20 text-discord-success' : 'bg-discord-danger/20 text-discord-danger'}`}>
                    {r.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="p-3">
                  <button onClick={() => toggleActive(r)} className="text-discord-danger hover:text-white"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-discord-muted">No hay resellers</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-discord-card rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">Nuevo Reseller</h3>
              <button onClick={() => setShowModal(false)} className="text-discord-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" placeholder="Discord User ID" value={form.discordUserId} onChange={e => setForm({...form, discordUserId: e.target.value})} />
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" placeholder="Discord Username" value={form.discordUsername} onChange={e => setForm({...form, discordUsername: e.target.value})} />
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" placeholder="Codigo (ej: CID-JUAN)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" type="number" placeholder="% Comision" value={form.commission} onChange={e => setForm({...form, commission: parseInt(e.target.value)})} />
              <button onClick={create} className="w-full py-2 bg-discord-primary text-white rounded hover:opacity-90">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
