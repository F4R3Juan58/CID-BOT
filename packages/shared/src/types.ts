export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  type: 'key' | 'download' | 'both';
  imageUrl: string | null;
  downloadUrl: string | null;
  active: boolean;
  roleName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KeyDTO {
  id: string;
  code: string;
  productId: string;
  status: 'available' | 'sold' | 'revoked';
  orderId: string | null;
  createdAt: string;
  usedAt: string | null;
}

export interface OrderDTO {
  id: string;
  discordUserId: string;
  discordUsername: string;
  productId: string;
  product?: ProductDTO;
  amount: number;
  paymentMethod: string;
  paymentId: string | null;
  status: string;
  resellerCode: string | null;
  keyId: string | null;
  key?: KeyDTO;
  createdAt: string;
  approvedAt: string | null;
  deliveredAt: string | null;
}

export interface CustomerDTO {
  id: string;
  discordUserId: string;
  discordUsername: string;
  email: string | null;
  verified: boolean;
  totalSpent: number;
  createdAt: string;
}

export interface ResellerDTO {
  id: string;
  discordUserId: string;
  discordUsername: string;
  code: string;
  commission: number;
  totalSales: number;
  totalCommission: number;
  active: boolean;
  createdAt: string;
}

export interface GiveawayDTO {
  id: string;
  productId: string;
  title: string;
  winners: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

export interface TicketDTO {
  id: string;
  discordUserId: string;
  discordUsername: string;
  channelId: string;
  reason: string;
  status: 'open' | 'closed';
  createdAt: string;
  closedAt: string | null;
}

export interface DashboardStats {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  totalRevenue: number;
  recentOrders: OrderDTO[];
  topProducts: { name: string; count: number }[];
  membersCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
