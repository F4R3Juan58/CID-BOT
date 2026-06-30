import { useEffect, useState } from 'react';
import { products as productsApi } from '../lib/api';
import { Plus, Edit, Trash2, Key, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  type: string;
  imageUrl: string | null;
  downloadUrl: string | null;
  roleName: string | null;
  active: boolean;
}

export default function Products() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [keysModal, setKeysModal] = useState<Product | null>(null);
  const [keys, setKeys] = useState<any[]>([]);
  const [bulkCodes, setBulkCodes] = useState('');

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: 0, type: 'key',
    imageUrl: '', downloadUrl: '', roleName: '',
  });

  const load = async () => {
    const res = await productsApi.list();
    setProductList(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditProduct(null);
    setForm({ name: '', slug: '', description: '', price: 0, type: 'key', imageUrl: '', downloadUrl: '', roleName: '' });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, slug: p.slug, description: p.description, price: p.price, type: p.type, imageUrl: p.imageUrl || '', downloadUrl: p.downloadUrl || '', roleName: p.roleName || '' });
    setShowModal(true);
  };

  const save = async () => {
    if (editProduct) {
      await productsApi.update(editProduct.id, form);
    } else {
      await productsApi.create(form);
    }
    setShowModal(false);
    load();
  };

  const del = async (id: string) => {
    if (!confirm('Eliminar producto?')) return;
    await productsApi.delete(id);
    load();
  };

  const toggleActive = async (p: Product) => {
    await productsApi.update(p.id, { active: !p.active });
    load();
  };

  const openKeys = async (p: Product) => {
    const res = await productsApi.getKeys(p.id);
    setKeys(res.data);
    setKeysModal(p);
  };

  const addBulkKeys = async () => {
    if (!keysModal || !bulkCodes.trim()) return;
    const codes = bulkCodes.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
    await productsApi.addKeys(keysModal.id, codes);
    setBulkCodes('');
    openKeys(keysModal);
  };

  if (loading) return <div className="text-discord-muted">Cargando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Productos</h2>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-discord-primary text-white rounded hover:opacity-90 transition">
          <Plus size={16} /> Nuevo Producto
        </button>
      </div>

      <div className="bg-discord-card rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-discord-hover text-discord-muted text-left">
              <th className="p-3">Nombre</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Activo</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((p) => (
              <tr key={p.id} className="border-b border-discord-hover">
                <td className="p-3 text-white">{p.name}</td>
                <td className="p-3 text-discord-muted">{p.slug}</td>
                <td className="p-3 text-discord-success">${p.price.toFixed(2)}</td>
                <td className="p-3 text-discord-muted">{p.type}</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleActive(p)}
                    className={`px-2 py-0.5 rounded text-xs ${p.active ? 'bg-discord-success/20 text-discord-success' : 'bg-discord-danger/20 text-discord-danger'}`}
                  >
                    {p.active ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-discord-primary hover:text-white"><Edit size={16} /></button>
                    <button onClick={() => openKeys(p)} className="text-discord-warning hover:text-white"><Key size={16} /></button>
                    <button onClick={() => del(p.id)} className="text-discord-danger hover:text-white"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {productList.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-discord-muted">No hay productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-discord-card rounded-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">{editProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setShowModal(false)} className="text-discord-muted hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} disabled={!!editProduct} />
              <textarea className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" placeholder="Descripcion" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" type="number" placeholder="Precio" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)})} />
              <select className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="key">Key</option>
                <option value="download">Descarga</option>
                <option value="both">Key + Descarga</option>
              </select>
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" placeholder="URL Imagen" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} />
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" placeholder="URL Descarga" value={form.downloadUrl} onChange={e => setForm({...form, downloadUrl: e.target.value})} />
              <input className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white" placeholder="Rol a asignar (ej: CID Owner)" value={form.roleName} onChange={e => setForm({...form, roleName: e.target.value})} />
              <button onClick={save} className="w-full py-2 bg-discord-primary text-white rounded hover:opacity-90">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Keys Modal */}
      {keysModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-discord-card rounded-lg w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">Keys: {keysModal.name}</h3>
              <button onClick={() => setKeysModal(null)} className="text-discord-muted hover:text-white"><X size={20} /></button>
            </div>
            <div>
              <div className="flex gap-2 mb-4">
                <span className="text-sm text-discord-success">Disponibles: {keys.filter((k: any) => k.status === 'available').length}</span>
                <span className="text-sm text-discord-primary">Vendidas: {keys.filter((k: any) => k.status === 'sold').length}</span>
                <span className="text-sm text-discord-danger">Revocadas: {keys.filter((k: any) => k.status === 'revoked').length}</span>
              </div>
              <div className="mb-4">
                <textarea
                  className="w-full px-3 py-2 bg-discord-bg border border-discord-hover rounded text-white text-sm"
                  placeholder="Pega las keys aca (una por linea)"
                  rows={5}
                  value={bulkCodes}
                  onChange={(e) => setBulkCodes(e.target.value)}
                />
                <button onClick={addBulkKeys} className="mt-2 px-4 py-1 bg-discord-primary text-white rounded text-sm hover:opacity-90">Agregar Keys</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
