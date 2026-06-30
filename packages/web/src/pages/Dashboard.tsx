import { useEffect, useState } from 'react';
import { dashboard } from '../lib/api';
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

interface Stats {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  totalRevenue: number;
  membersCount: number;
  recentOrders: Array<{ id: string; discordUsername: string; product: { name: string }; amount: number; createdAt: string }>;
  topProducts: Array<{ name: string; count: number }>;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboard.stats().then((res) => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-discord-muted">Cargando...</div>;
  if (!stats) return <div className="text-discord-danger">Error al cargar estadisticas</div>;

  const cards = [
    { label: 'Ventas Hoy', value: stats.salesToday, icon: ShoppingCart, color: 'text-discord-success' },
    { label: 'Ventas Semana', value: stats.salesWeek, icon: ShoppingCart, color: 'text-discord-warning' },
    { label: 'Ventas Mes', value: stats.salesMonth, icon: ShoppingCart, color: 'text-discord-primary' },
    { label: 'Ingresos Totales', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-discord-success' },
    { label: 'Clientes', value: stats.membersCount, icon: Users, color: 'text-discord-warning' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-discord-card p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-discord-muted text-sm">{card.label}</span>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-discord-card p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-4">Top Productos</h3>
          {stats.topProducts.length === 0 ? (
            <p className="text-discord-muted text-sm">No hay ventas registradas</p>
          ) : (
            <div className="space-y-2">
              {stats.topProducts.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-discord-text">{p.name}</span>
                  <span className="text-discord-muted">{p.count} ventas</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-discord-card p-4 rounded-lg">
          <h3 className="text-white font-semibold mb-4">Ultimas Ventas</h3>
          {stats.recentOrders.length === 0 ? (
            <p className="text-discord-muted text-sm">No hay ventas recientes</p>
          ) : (
            <div className="space-y-2">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="flex justify-between text-sm">
                  <div>
                    <span className="text-discord-text">{o.discordUsername}</span>
                    <span className="text-discord-muted ml-2">- {o.product?.name || 'N/A'}</span>
                  </div>
                  <span className="text-discord-success">${o.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
