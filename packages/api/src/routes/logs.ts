import { Router, Request, Response } from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/orders', async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    where: { status: { in: ['approved', 'delivered'] } },
    include: { product: true, key: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  res.json({ success: true, data: orders });
});

router.get('/keys', async (_req: Request, res: Response) => {
  const keys = await prisma.key.findMany({
    where: { status: { in: ['sold', 'revoked'] } },
    orderBy: { usedAt: 'desc' },
    take: 200,
  });
  res.json({ success: true, data: keys });
});

export default router;
