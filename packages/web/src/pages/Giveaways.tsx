import { useEffect, useState } from 'react';
import { giveaways as giveawaysApi } from '../lib/api';
import { products as productsApi } from '../lib/api';
import { Plus, Gift, X } from 'lucide-react';

export default function Giveaways() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [productList, setProductList] = useState<any[]>([]);
  const [form, setForm] = useState({ productId: '', title: '', winners: 1, durationMinutes: 60 });

  const load = async () => {
    const [g, p] = await Promise.all([giveawaysApi.list(), productsApi.list()]);
    setList(g.data);
    setProductList(p.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    await giveawaysApi.create(form);
    setShowModal(false);
    load();
  };

  const end = async (id: string) => {
    if (!confirm('Finalizar sorteo y elegir ganadores?')) return;
    const res = await giveawaysApi.end(id);
    alert(`Ganadores: ${res.data.winners.map((w: any) => w.discordUsername).join(', ')}`);
    load();
  };

  if (loading) return <div className="text-discord-muted">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Giveaways</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-discord-primary text-white rounded hover:opacity-90 transition">
          <Plus size={16} /> Nuevo Giveaway
        </button>
      </div>

      <div className="grid gap-4">
        {list.map((g: any) => (
          <div key={g.id} className="bg-discord-card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift size={24} className={g.active ? 'text-discord-success' : 'text-discord-muted'} />
                <div>
                  <h3 className="text-white font-semibold">{g.title}</h3>
                  <p className="text-discord-muted text-sm">
                    Producto: {g.product?.name || 'N/A'} | Participantes: {g._count?.entries || 0} | Ganadores: {g.winners}
                  </p>
                  <p className="text-discord-muted text-xs">
                    Inicio: {new Date(g.startDate).toLocaleString()} | Fin: {new Date(g.endDate).toLocaleString()}
                  </p>
                </div>
              </div>
              {g.active && (
                <button onClick={() => end(g.id)} className="px-4 py-2 bg-discord-danger text-white rounded text-sm hover:opacity-90">
                  Finalizar
                </button>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-discord-muted text-center py-8">No hay giveaways</p>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-discord-card rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">Nuevo Giveaway</h3>
              <button onClick={() => setShowModal(false)} className="text-discord-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" placeholder="Titulo" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <select className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" value={form.productId} onChange={e => setForm({...form, productId: e.target.value})}>
                <option value="">Seleccionar producto...</option>
                {productList.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" type="number" placeholder="Cantidad de ganadores" value={form.winners} onChange={e => setForm({...form, winners: parseInt(e.target.value)})} />
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" type="number" placeholder="Duracion (minutos)" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: parseInt(e.target.value)})} />
              <button onClick={create} className="w-full py-2 bg-discord-primary text-white rounded hover:opacity-90">Crear Giveaway</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
