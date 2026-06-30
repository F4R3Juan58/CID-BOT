import { Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

      <div className="grid gap-6 max-w-2xl">
        <div className="bg-discord-card p-6 rounded-lg">
          <h3 className="text-white font-semibold mb-4">Configuracion General</h3>
          <p className="text-discord-muted text-sm mb-4">
            La configuracion se realiza mediante el archivo <code className="bg-discord-bg px-2 py-0.5 rounded text-discord-primary">.env</code> en
            el servidor. Las variables disponibles son:
          </p>
          <div className="bg-discord-bg p-3 rounded text-xs text-discord-muted space-y-1 font-mono">
            <div>DISCORD_TOKEN=token_del_bot</div>
            <div>DISCORD_CLIENT_ID=id_del_bot</div>
            <div>DISCORD_GUILD_ID=id_del_servidor</div>
            <div>PAYPAL_CLIENT_ID=...</div>
            <div>STRIPE_SECRET_KEY=sk_...</div>
            <div>JWT_SECRET=secreto_jwt</div>
            <div>DATABASE_URL=file:./data/prod.db</div>
          </div>
        </div>

        <div className="bg-discord-card p-6 rounded-lg">
          <h3 className="text-white font-semibold mb-4">Backup & Restore</h3>
          <p className="text-discord-muted text-sm">
            La base de datos SQLite se encuentra en <code className="bg-discord-bg px-2 py-0.5 rounded text-discord-primary">data/dev.db</code>.
            Para hacer backup, copia ese archivo. Para restaurar, reemplazalo y reinicia.
          </p>
        </div>

        <div className="bg-discord-card p-6 rounded-lg">
          <h3 className="text-white font-semibold mb-4">Acerca de</h3>
          <p className="text-discord-muted text-sm">CID BOT v1.0.0 - Plataforma de venta de software via Discord.</p>
        </div>
      </div>
    </div>
  );
}
