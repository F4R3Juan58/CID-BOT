import { Server } from 'lucide-react';

export default function ServerBuilder() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Server Builder</h2>

      <div className="bg-discord-card p-8 rounded-lg text-center">
        <Server size={48} className="mx-auto mb-4 text-discord-muted" />
        <h3 className="text-white font-semibold mb-2">Gestion de Servidor</h3>
        <p className="text-discord-muted text-sm mb-4">
          Usa el comando <code className="bg-discord-bg px-2 py-0.5 rounded text-discord-primary">/setup wizard</code> en Discord
          para crear toda la estructura automaticamente.
        </p>
        <p className="text-discord-muted text-xs">
          La funcionalidad drag & drop del server builder estara disponible en una version futura.
        </p>
      </div>
    </div>
  );
}
