# CID_BOT - Product Brainstorm & Task Plan

> Bot de Discord + Panel Web para venta de software (keys y descargables).
> Plataforma: tienda automatizada, gestion de clientes, sistema de resellers y aprobacion manual de ventas.

---

## 1. VISION GENERAL

Plataforma todo-en-uno que convierte un servidor de Discord en una tienda profesional de software. El bot gestiona el catalogo, los pagos, la entrega de licencias y el soporte post-venta. El panel web permite administrar productos, stock, ventas, clientes y resellers sin tocar codigo.

**Software inicial a vender:** CID (herramienta para ARK ASA) - keys de licencia + descargable.

---

## 2. CANALES DEL SERVIDOR

### Categoria: BIENVENIDA

| Canal | Tipo | Funcion |
|---|---|---|
| `#welcome` | texto | Verificacion + reglas del server (unico canal visible al entrar) |

### Categoria: TIENDA

| Canal | Tipo | Funcion |
|---|---|---|
| `#reviews` | texto | Testimonios de compradores. Bot postea review al entregar producto. |
| `#faq` | texto | Preguntas frecuentes sobre productos, pagos, garantia. |
| `#how-to-buy` | texto | Guia paso a paso: como comprar, pagar y recibir el producto. |
| `#giveaway` | texto | Sorteos de licencias/keys. Bot gestiona participantes y ganadores. |

### Categoria: COMUNIDAD

| Canal | Tipo | Funcion |
|---|---|---|
| `#anuncios` | texto (solo admin) | Anuncios oficiales, nuevos productos, ofertas, changelogs. |
| `#public-chat` | texto | Chat general de la comunidad. |
| `#invite-tracker` | texto | Ranking de invitaciones. Bot postea quien invito a quien. |

### Categoria: ARK ASA

| Canal | Tipo | Funcion |
|---|---|---|
| `#cid-info` | texto | Informacion del CID, features, precios, FAQ especifico. |
| `#cid-soporte` | texto (privado) | Soporte tecnico exclusivo para compradores de CID. |
| `#cid-updates` | texto (solo admin) | Changelog y versiones del CID. |

### Categoria: STAFF (oculta para no-staff)

| Canal | Tipo | Funcion |
|---|---|---|
| `#staff-chat` | texto | Comunicacion interna del equipo. |
| `#logs-ventas` | texto | Registro automatico de ventas aprobadas. |
| `#logs-keys` | texto | Registro de keys entregadas (ultimos 4 caracteres). |

---

## 3. ROLES Y PERMISOS

| Rol | Color | Permisos clave |
|---|---|---|
| `@everyone` | default | Solo ver `#welcome` |
| `Verificado` | verde | Ver tienda + comunidad. Se asigna al aceptar reglas. |
| `Cliente` | azul | Comprador verificado. Acceso a soporte de su producto. |
| `CID Owner` | dorado | Acceso a `#cid-soporte`, `#cid-updates`. Asignado al comprar CID. |
| `Reseller` | purpura | Afiliado con codigo de descuento/comision. |
| `Staff` | rojo | Soporte, moderacion, acceso a staff-chat. |
| `Admin` | negro | Full acceso. Unico con acceso al panel web. |
| `Bot` | gris | Rol del bot (permisos tecnicos). |

---

## 4. BOT DE DISCORD

### 4.1 Comandos Slash - Cliente

| Comando | Descripcion |
|---|---|
| `/buy <producto> [reseller]` | Inicia proceso de compra. Opcional: codigo de reseller. |
| `/mykeys` | Lista keys compradas por el usuario (solo visibles para el). |
| `/download <producto>` | Devuelve link de descarga si ya compro el producto. |
| `/support` | Crea ticket de soporte privado. |
| `/giveaway` | Participa en sorteo activo. |
| `/invite` | Devuelve link de invitacion personalizado. |
| `/verify` | Acepta reglas y obtiene rol Verificado. |

### 4.2 Comandos Slash - Staff/Admin

| Comando | Descripcion |
|---|---|
| `/setup wizard` | Crea toda la estructura del servidor desde cero. |
| `/setup reset` | Borra estructura actual (peligroso, requiere confirmacion). |
| `/product add` | Agrega producto al catalogo (nombre, precio, desc, imagen). |
| `/product edit <id>` | Edita producto existente. |
| `/product list` | Lista productos activos. |
| `/key add <producto> <codigo>` | Agrega una key manualmente. |
| `/key bulk <producto>` | Sube archivo .txt/.csv con keys al stock. |
| `/key revoke <codigo>` | Revoca una key entregada. |
| `/giveaway create` | Crea un sorteo (producto, keys, duracion). |
| `/giveaway end <id>` | Finaliza sorteo y elige ganador. |
| `/reseller add <user> <code>` | Crea codigo de reseller para un usuario. |
| `/reseller stats <code>` | Ver estadisticas de un reseller. |
| `/support close` | Cierra ticket de soporte actual. |

### 4.3 Automatizaciones

| Automatizacion | Trigger | Accion |
|---|---|---|
| **Bienvenida** | Usuario entra al server | DM con mensaje de bienvenida + instrucciones |
| **Verificacion** | Usuario usa `/verify` | Rol `Verificado` asignado |
| **Deteccion de pago** | Webhook de PayPal/Stripe | Crea orden en estado "pendiente de aprobacion" |
| **Aprobacion manual** | Admin aprueba desde panel web | Bot entrega key + link descarga + rol `Cliente` + rol del producto |
| **Review post-compra** | 24h despues de entrega | Bot DM pidiendo dejar review en `#reviews` |
| **Invite tracker** | Usuario se une con invite | Bot registra inviter/invited, actualiza leaderboard |
| **Low stock alert** | Stock < 5 keys de un producto | Alerta en `#staff-chat` |
| **Key revocada** | Admin revoca key | DM al usuario notificando, rol del producto removido |

---

## 5. PANEL WEB (React + Vite + TailwindCSS)

### 5.1 Login

Autenticacion local con usuario y contrasena (unico admin). Protegido con JWT. Posibilidad futura: 2FA con TOTP.

### 5.2 Secciones del panel

#### Dashboard
- Cards: Ventas de hoy / semana / mes
- Ingresos totales (grafico de linea: ultimos 30 dias)
- Top productos vendidos (grafico de torta)
- Keys en stock vs vendidas por producto
- Miembros totales del server
- Ultimas 5 ventas

#### Productos
- Tabla CRUD: nombre, slug, precio, tipo (key / download), activo (toggle)
- Editor de producto (modal/pagina):
  - Titulo, descripcion (Markdown), precio
  - Imagen principal (upload o URL)
  - Archivo descargable (upload de .zip)
  - Config de roles que se asignan al comprar
  - Canales de soporte asociados
- Stock de keys: tabla con filtros (disponible / vendida / revocada)
- Upload masivo de keys: .txt o .csv

#### Ventas / Ordenes
- Tabla con todas las ordenes: fecha, cliente, producto, monto, metodo, estado
- Estados: `pendiente_pago` -> `pendiente_aprobacion` -> `aprobada` -> `entregada` | `rechazada`
- Filtros por estado, producto, fecha
- Boton "Aprobar" / "Rechazar" en ordenes pendientes
- Exportar CSV
- Modal de detalle de orden: datos completos, key asignada, timestamps

#### Clientes
- Tabla: Discord username, email, fecha registro, total gastado, cantidad compras
- Perfil de cliente: historial de compras, keys asignadas, tickets abiertos
- Busqueda por username o Discord ID

#### Resellers
- Tabla: usuario, codigo, ventas referidas, comision acumulada, % comision
- Crear/Eliminar codigo de reseller
- Historial de ventas por reseller
- Config de porcentaje de comision global

#### Giveaways
- Lista de giveaways activos y pasados
- Crear giveaway: producto, cantidad de winners, duracion, requisitos
- Finalizar manualmente + reroll

#### Server Builder
- Vista de arbol de categorias y canales actuales del server
- Drag & drop para reordenar
- Boton "+" para crear canal/categoria
- Editor de permisos por canal: matriz rol x permiso
- Templates: guardar configuracion actual, cargar template

#### Logs
- Log de acciones del bot (comandos ejecutados, errores)
- Log de ventas (quien compro, que, cuando, key)
- Log de keys (asignacion, revocacion)
- Log de panel (acciones del admin)

#### Settings
- Configuracion general del bot
- Conexiones de pago: claves API de PayPal y Stripe
- Prefijo de comandos / configuracion de webhooks
- Backup y restore de la DB

---

## 6. FLUJO DE COMPRA COMPLETO

```
1. Usuario entra al Discord -> ve #welcome -> /verify -> rol Verificado
2. Navega canales, ve un producto en #cid-info o #anuncios
3. Usa /buy CID [reseller:CID-JUAN]
4. Bot responde (solo visible para el):
   "Producto: CID | Precio: $XX | Reseller: CID-JUAN (opcional)"
   "Elegi metodo de pago: [PayPal] [Stripe]"
5. Usuario elige -> bot genera link/codigo de pago via API
6. Usuario paga -> webhook de PayPal/Stripe notifica al backend
7. Backend crea Order en estado "pendiente_aprobacion"
8. Bot notifica en #staff-chat: "Nueva venta pendiente de aprobacion"
9. Admin revisa el panel web -> aprueba
10. Backend -> Bot entrega:
    - DM: "Tu compra fue aprobada. Key: XXXX-XXXX-XXXX | Descarga: link.zip"
    - Rol "Cliente" + "CID Owner" asignados
    - Acceso a #cid-soporte y #cid-updates
    - Bot postea en #logs-ventas y #logs-keys
11. Bot agenda recordatorio de review para 24h despues
```

---

## 7. SISTEMA DE RESELLERS

```
Flujo:
1. Admin crea codigo en panel: reseller "CID-JUAN" -> usuario @juan
2. Reseller comparte su codigo en redes sociales, YouTube, etc.
3. Cliente usa /buy CID reseller:CID-JUAN
4. Al aprobarse la venta, se registra comision:
   - Si comision = 10%, venta = $50 -> $5 para el reseller
5. Panel muestra: ventas totales, comision acumulada, payout pendiente
6. Futuro: sistema de payout automatico (PayPal payout API)

Reglas:
- Un reseller no puede usar su propio codigo
- Si el cliente ya compro antes, el codigo de reseller se ignora (evitar abuso)
- Codigo de reseller valido solo si el producto no esta en oferta (configurable)
```

---

## 8. STACK TECNOLOGICO

| Capa | Tecnologia | Justificacion |
|---|---|---|
| Runtime | Node.js 20 LTS | Ecosistema Discord, npm |
| Bot | discord.js v14 | Estandar, TypeScript nativo, soporte slash commands |
| Lenguaje | TypeScript 5.x | Tipado seguro en todo el proyecto |
| API Backend | Express 4.x + TypeScript | Simple, sin overhead |
| Frontend | React 18 + Vite 5 | Rapido, moderno, facil de personalizar |
| CSS | TailwindCSS 3.x | Desarrollo agil de UI |
| ORM | Prisma 5.x | Type-safe, migrations automaticas |
| DB | SQLite (dev) / PostgreSQL (prod) | SQLite para empezar, migrable a PG sin cambiar codigo |
| Auth Panel | JWT + bcrypt | Login local simple |
| Pagos | Stripe API + PayPal REST API | Webhooks para automatizacion |
| Deploy | Docker Compose | Un comando levanta todo |
| Monorepo | Turborepo | Builds paralelos, cache, dependencias compartidas |
| Testing | Vitest (unit) + Playwright (E2E UI) | Modernos, rapidos |

---

## 9. ESQUEMA DE BASE DE DATOS

```prisma
model Product {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  description   String
  price         Float
  type          String   // "key" | "download" | "both"
  imageUrl      String?
  downloadUrl   String?
  active        Boolean  @default(true)
  roleName      String?  // Rol de Discord a asignar al comprar (ej: "CID Owner")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  keys          Key[]
  orders        Order[]
  giveaways     Giveaway[]
}

model Key {
  id         String    @id @default(cuid())
  code       String    @unique
  productId  String
  product    Product   @relation(fields: [productId], references: [id])
  status     String    @default("available") // available | sold | revoked
  orderId    String?
  order      Order?    @relation(fields: [orderId], references: [id])
  createdAt  DateTime  @default(now())
  usedAt     DateTime?
}

model Order {
  id              String    @id @default(cuid())
  discordUserId   String
  discordUsername String
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  amount          Float
  paymentMethod   String    // "paypal" | "stripe"
  paymentId       String?   // ID de transaccion externa
  status          String    @default("pending_payment") // pending_payment | pending_approval | approved | delivered | rejected
  resellerCode    String?
  keyId           String?
  key             Key?      @relation(fields: [keyId], references: [id])
  createdAt       DateTime  @default(now())
  approvedAt      DateTime?
  deliveredAt     DateTime?
}

model Customer {
  id              String   @id @default(cuid())
  discordUserId   String   @unique
  discordUsername String
  email           String?
  verified        Boolean  @default(false)
  totalSpent      Float    @default(0)
  createdAt       DateTime @default(now())
  orders          Order[]
}

model Giveaway {
  id          String    @id @default(cuid())
  productId   String
  product     Product   @relation(fields: [productId], references: [id])
  title       String
  winners     Int       @default(1)
  startDate   DateTime
  endDate     DateTime
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  entries     GiveawayEntry[]
  keys        Key[]     // Keys reservadas para el giveaway
}

model GiveawayEntry {
  id              String   @id @default(cuid())
  giveawayId      String
  giveaway        Giveaway @relation(fields: [giveawayId], references: [id])
  discordUserId   String
  discordUsername String
  enteredAt       DateTime @default(now())
}

model Invite {
  id               String   @id @default(cuid())
  inviterUserId    String
  invitedUserId    String
  invitedUsername  String
  code             String
  joinedAt         DateTime @default(now())
}

model Reseller {
  id              String   @id @default(cuid())
  discordUserId   String
  discordUsername String
  code            String   @unique
  commission      Float    @default(10) // porcentaje
  totalSales      Int      @default(0)
  totalCommission Float    @default(0)
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
}

model Ticket {
  id              String   @id @default(cuid())
  discordUserId   String
  discordUsername String
  channelId       String
  reason          String
  status          String   @default("open") // open | closed
  createdAt       DateTime @default(now())
  closedAt        DateTime?
}

model Admin {
  id        String   @id @default(cuid())
  username  String   @unique
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
}

model ServerConfig {
  id      String @id @default(cuid())
  guildId String
  key     String
  value   String

  @@unique([guildId, key])
}
```

---

## 10. ESTRUCTURA DEL MONOREPO

```
cid-bot/
├── .github/
│   └── workflows/          # CI/CD (tests, build, docker push)
├── packages/
│   ├── bot/                # Discord bot
│   │   ├── src/
│   │   │   ├── index.ts           # Entry point
│   │   │   ├── client.ts          # Discord client setup
│   │   │   ├── commands/          # Slash command handlers
│   │   │   │   ├── buy.ts
│   │   │   │   ├── mykeys.ts
│   │   │   │   ├── support.ts
│   │   │   │   ├── verify.ts
│   │   │   │   └── admin/
│   │   │   │       ├── setup.ts
│   │   │   │       ├── product.ts
│   │   │   │       ├── key.ts
│   │   │   │       ├── giveaway.ts
│   │   │   │       └── reseller.ts
│   │   │   ├── events/            # Discord event handlers
│   │   │   │   ├── guildMemberAdd.ts
│   │   │   │   ├── interactionCreate.ts
│   │   │   │   └── messageCreate.ts
│   │   │   ├── services/          # Business logic
│   │   │   │   ├── payment.ts
│   │   │   │   ├── delivery.ts
│   │   │   │   ├── giveaway.ts
│   │   │   │   ├── invite.ts
│   │   │   │   └── setup.ts
│   │   │   └── utils/
│   │   │       ├── embeds.ts
│   │   │       ├── permissions.ts
│   │   │       └── db.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api/                 # REST API backend
│   │   ├── src/
│   │   │   ├── index.ts           # Express app entry
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── products.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── customers.ts
│   │   │   │   ├── resellers.ts
│   │   │   │   ├── giveaways.ts
│   │   │   │   ├── server.ts
│   │   │   │   ├── logs.ts
│   │   │   │   └── webhooks/
│   │   │   │       ├── paypal.ts
│   │   │   │       └── stripe.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   └── errorHandler.ts
│   │   │   └── services/
│   │   │       ├── payment.ts
│   │   │       ├── delivery.ts
│   │   │       └── discord.ts    # Comunicacion con el bot
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                 # Frontend React panel
│   │   ├── src/
│   │   │   ├── main.tsx
│   │   │   ├── App.tsx
│   │   │   ├── pages/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Products.tsx
│   │   │   │   ├── Orders.tsx
│   │   │   │   ├── Customers.tsx
│   │   │   │   ├── Resellers.tsx
│   │   │   │   ├── Giveaways.tsx
│   │   │   │   ├── ServerBuilder.tsx
│   │   │   │   ├── Logs.tsx
│   │   │   │   └── Settings.tsx
│   │   │   ├── components/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── OrderTable.tsx
│   │   │   │   ├── KeyManager.tsx
│   │   │   │   └── charts/
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useApi.ts
│   │   │   └── lib/
│   │   │       ├── api.ts
│   │   │       └── types.ts
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   └── shared/              # Codigo compartido
│       └── src/
│           ├── types.ts     # Interfaces y tipos
│           ├── constants.ts # Constantes (roles, canales, etc.)
│           └── utils.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── docker/
│   ├── Dockerfile.bot
│   ├── Dockerfile.api
│   └── Dockerfile.web
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── turbo.json
├── package.json            # Root workspace
├── tsconfig.base.json
└── PRODUCT_BRAINSTORM.md
```

---

## 11. TASK PLAN - ORDEN DE IMPLEMENTACION

### FASE 1 - Fundacion del proyecto

- [ ] 1.1 Inicializar monorepo con Turborepo
- [ ] 1.2 Configurar TypeScript base, ESLint, Prettier
- [ ] 1.3 Configurar Prisma con SQLite y crear migracion inicial
- [ ] 1.4 Crear `.env.example` con todas las variables
- [ ] 1.5 Crear `docker-compose.yml` con los 3 servicios
- [ ] 1.6 Configurar CI/CD basico (GitHub Actions: lint, typecheck)

### FASE 2 - Bot de Discord (packages/bot)

- [ ] 2.1 Setup de discord.js v14 con cliente y handler de eventos
- [ ] 2.2 Sistema de registro de slash commands
- [ ] 2.3 Comando `/setup wizard` - crea categorias, canales y roles desde cero
- [ ] 2.4 Comando `/verify` - asigna rol Verificado
- [ ] 2.5 Comando `/buy <producto> [reseller]` - inicia flujo de compra
- [ ] 2.6 Comando `/mykeys` - lista keys del usuario
- [ ] 2.7 Comando `/download <producto>` - link de descarga para compradores
- [ ] 2.8 Comando `/support` - crea ticket privado
- [ ] 2.9 Evento `guildMemberAdd` - DM bienvenida + log de invite
- [ ] 2.10 Sistema de giveaways: crear, entrar, finalizar, reroll
- [ ] 2.11 Comandos admin: `/product add|edit|list`
- [ ] 2.12 Comandos admin: `/key add|bulk|revoke`
- [ ] 2.13 Comandos admin: `/reseller add|stats`
- [ ] 2.14 Sistema de embeds bonitos para catalogo y anuncios
- [ ] 2.15 Alertas de stock bajo en `#staff-chat`

### FASE 3 - API Backend (packages/api)

- [ ] 3.1 Setup Express + TypeScript con middleware base
- [ ] 3.2 Auth: login local con JWT + bcrypt
- [ ] 3.3 CRUD Productos (con upload de imagenes, controlador de archivos)
- [ ] 3.4 CRUD Keys (individual + bulk upload .txt/.csv)
- [ ] 3.5 Endpoints de Ordenes: listar, filtrar, aprobar, rechazar, detalle
- [ ] 3.6 Webhook de PayPal: recibir IPN, crear orden pendiente
- [ ] 3.7 Webhook de Stripe: recibir evento, crear orden pendiente
- [ ] 3.8 Endpoints de Clientes: listar, buscar, perfil con historial
- [ ] 3.9 CRUD Resellers: crear codigo, stats, comisiones
- [ ] 3.10 Endpoints de Giveaways: crear, listar, finalizar
- [ ] 3.11 Endpoints de Server Config: leer/escribir estructura del server
- [ ] 3.12 Endpoints de Logs: consultar logs de bot, ventas, keys
- [ ] 3.13 Endpoint de Stats del Dashboard: ventas, ingresos, top productos
- [ ] 3.14 Endpoint de exportacion CSV de ordenes
- [ ] 3.15 Sistema de aprobacion manual: endpoint que dispara entrega via bot
- [ ] 3.16 Comunicacion API <-> Bot (Redis/pubsub o WebSocket local)

### FASE 4 - Panel Web (packages/web)

- [ ] 4.1 Setup React + Vite + TailwindCSS + React Router
- [ ] 4.2 Layout base: Sidebar + Header + Content
- [ ] 4.3 Pagina de Login con formulario JWT
- [ ] 4.4 Pagina Dashboard con cards de stats + graficos (Recharts)
- [ ] 4.5 Pagina Productos: tabla CRUD, modal de editor, upload de imagen/archivo
- [ ] 4.6 Pagina Productos: gestor de keys, bulk upload
- [ ] 4.7 Pagina Ventas/Ordenes: tabla con filtros, botones aprobar/rechazar, detalle
- [ ] 4.8 Pagina Clientes: tabla, busqueda, perfil con historial
- [ ] 4.9 Pagina Resellers: tabla, crear codigo, stats
- [ ] 4.10 Pagina Giveaways: crear, historial, finalizar
- [ ] 4.11 Pagina Server Builder: arbol de canales, drag & drop (dnd-kit)
- [ ] 4.12 Pagina Logs: visor de logs con filtros
- [ ] 4.13 Pagina Settings: config de API keys, backup/restore
- [ ] 4.14 Proteccion de rutas (redirect a login si no autenticado)
- [ ] 4.15 Tema oscuro por defecto (estilo Discord)
- [ ] 4.16 Responsive design para mobile/tablet

### FASE 5 - Integracion y despliegue

- [ ] 5.1 Probar flujo de compra completo end-to-end
- [ ] 5.2 Configurar ngrok/webhook local para testear PayPal y Stripe
- [ ] 5.3 Script de deploy: `docker compose up -d`
- [ ] 5.4 Nginx reverse proxy para API + Web (mismo dominio, distintos paths)
- [ ] 5.5 SSL con Let's Encrypt / Certbot
- [ ] 5.6 Backup automatico de DB (cron en Docker o script)
- [ ] 5.7 Monitoreo basico: healthcheck endpoints, logs docker
- [ ] 5.8 Setup de Sentry o similar para error tracking

### FASE 6 - Pulido y extras

- [ ] 6.1 Tests unitarios (Vitest) para servicios criticos: payment, delivery, keys
- [ ] 6.2 Tests E2E (Playwright) para flujo de compra en panel web
- [ ] 6.3 Documentacion: README de instalacion para el comprador
- [ ] 6.4 Documentacion: guia de personalizacion (colores, textos, embeds)
- [ ] 6.5 README para revendedores (white-label opcional)
- [ ] 6.6 Sistema de notificaciones en panel (toast en nuevas ventas)
- [ ] 6.7 Modo mantenimiento (toggle que pausa ventas)
- [ ] 6.8 Rate limiting en API para prevenir abusos
- [ ] 6.9 Logs de auditoria de acciones del admin en el panel
- [ ] 6.10 Soporte multi-lenguaje (i18n) - ingles por defecto, espanol opcional
- [ ] 6.11 Sistema de backups/restore de configuracion del server
- [ ] 6.12 Docker healthchecks para todos los servicios
- [ ] 6.13 `.gitignore`, `.dockerignore`, `.env.example` completos

---

## 12. IDEAS FUTURAS (BACKLOG)

- **Multiples metodos de pago:** cripto (Coinbase Commerce), MercadoPago
- **Sistema de suscripciones:** software con pago recurrente mensual/anual
- **Licencias por tiempo:** keys que expiran automaticamente a los X dias
- **Panel de cliente:** que los compradores vean sus keys y descargas sin usar comandos
- **Marketplace interno:** que otros devs puedan listar su software en tu tienda
- **Sistema de reputacion:** scores de compradores/vendedores
- **Tickets con IA:** ChatGPT responde preguntas frecuentes antes de escalar a staff
- **Webhooks de salida:** notificar a sistemas externos en cada venta
- **Estadisticas avanzadas:** prediccion de stock, graficos de conversion
- **Split de pagos automatico:** a resellers via PayPal Payouts
- **Demo/trial automatico:** keys de prueba de X dias gestionadas por el bot
- **Actualizaciones de software:** upload de nueva version y notificacion a compradores
- **Badges/logros** en Discord por hitos (primer compra, top comprador, etc.)
- **Integracion con Tebex** u otras plataformas de monetizacion de juegos
