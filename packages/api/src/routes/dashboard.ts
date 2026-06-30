import { Router, Request, Response } from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/stats', async (_req: Request, res: Response) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [salesToday, salesWeek, salesMonth, totalRevenue, recentOrders, topProducts, membersCount] =
    await Promise.all([
      prisma.order.count({
        where: { status: { in: ['approved', 'delivered'] }, createdAt: { gte: startOfDay } },
      }),
      prisma.order.count({
        where: { status: { in: ['approved', 'delivered'] }, createdAt: { gte: startOfWeek } },
      }),
      prisma.order.count({
        where: { status: { in: ['approved', 'delivered'] }, createdAt: { gte: startOfMonth } },
      }),
      prisma.order.aggregate({
        where: { status: { in: ['approved', 'delivered'] } },
        _sum: { amount: true },
      }),
      prisma.order.findMany({
        where: { status: { in: ['approved', 'delivered'] } },
        include: { product: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.order.groupBy({
        by: ['productId'],
        where: { status: { in: ['approved', 'delivered'] } },
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5,
      }),
      prisma.customer.count(),
    ]);

  // Resolve product names for top products
  const topProductsWithNames = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      return { name: product?.name || item.productId, count: item._count.productId };
    }),
  );

  res.json({
    success: true,
    data: {
      salesToday,
      salesWeek,
      salesMonth,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentOrders,
      topProducts: topProductsWithNames,
      membersCount,
    },
  });
});

export default router;
