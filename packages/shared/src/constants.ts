export type ProductType = 'key' | 'download' | 'both';
export type OrderStatus =
  | 'pending_payment'
  | 'pending_approval'
  | 'approved'
  | 'delivered'
  | 'rejected';
export type KeyStatus = 'available' | 'sold' | 'revoked';
export type TicketStatus = 'open' | 'closed';
export type PaymentMethod = 'paypal' | 'stripe';

export const ROLES = {
  EVERYONE: '@everyone',
  VERIFICADO: 'Verificado',
  CLIENTE: 'Cliente',
  CID_OWNER: 'CID Owner',
  RESELLER: 'Reseller',
  STAFF: 'Staff',
  ADMIN: 'Admin',
  BOT: 'Bot',
} as const;

export const CHANNELS = {
  WELCOME: 'welcome',
  REVIEWS: 'reviews',
  FAQ: 'faq',
  HOW_TO_BUY: 'how-to-buy',
  GIVEAWAY: 'giveaway',
  ANUNCIOS: 'anuncios',
  PUBLIC_CHAT: 'public-chat',
  INVITE_TRACKER: 'invite-tracker',
  CID_INFO: 'cid-info',
  CID_SOPORTE: 'cid-soporte',
  CID_UPDATES: 'cid-updates',
  STAFF_CHAT: 'staff-chat',
  LOGS_VENTAS: 'logs-ventas',
  LOGS_KEYS: 'logs-keys',
} as const;

export const CATEGORIES = {
  BIENVENIDA: 'BIENVENIDA',
  TIENDA: 'TIENDA',
  COMUNIDAD: 'COMUNIDAD',
  ARK_ASA: 'ARK ASA',
  STAFF: 'STAFF',
} as const;
