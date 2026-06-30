import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Link,
  Gift,
  Server,
  ScrollText,
  Settings,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Productos' },
  { to: '/orders', icon: ShoppingCart, label: 'Ventas' },
  { to: '/customers', icon: Users, label: 'Clientes' },
  { to: '/resellers', icon: Link, label: 'Resellers' },
  { to: '/giveaways', icon: Gift, label: 'Giveaways' },
  { to: '/server', icon: Server, label: 'Server' },
  { to: '/logs', icon: ScrollText, label: 'Logs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="w-56 bg-discord-sidebar flex flex-col h-screen">
      <div className="p-4 border-b border-discord-hover">
        <h1 className="text-lg font-bold text-white">CID BOT</h1>
        <p className="text-xs text-discord-muted">Panel Admin</p>
      </div>

      <nav className="flex-1 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-discord-primary/20 text-white border-r-2 border-discord-primary'
                  : 'text-discord-muted hover:bg-discord-hover hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-discord-hover">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-discord-muted hover:bg-discord-hover hover:text-discord-danger rounded transition-colors"
        >
          <LogOut size={18} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
