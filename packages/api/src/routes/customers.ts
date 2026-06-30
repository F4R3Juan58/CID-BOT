import { Router, Request, Response } from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const { search } = req.query;

  const where: Record<string, any> = {};
  if (search) {
    where.OR = [
      { discordUsername: { contains: search as string } },
      { discordUserId: { contains: search as string } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { totalSpent: 'desc' },
    take: 100,
  });

  res.json({ success: true, data: customers });
});

router.get('/:id', async (req: Request, res: Response) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      orders: {
        include: { product: true, key: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!customer) {
    res.status(404).json({ success: false, error: 'Cliente no encontrado' });
    return;
  }

  res.json({ success: true, data: customer });
});

export default router;
