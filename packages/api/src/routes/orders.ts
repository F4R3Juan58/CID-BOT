import { Router, Request, Response } from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// List orders with optional filters
router.get('/', async (req: Request, res: Response) => {
  const { status, productId, search } = req.query;

  const where: Record<string, any> = {};
  if (status) where.status = status;
  if (productId) where.productId = productId;
  if (search) {
    where.OR = [
      { discordUsername: { contains: search as string } },
      { discordUserId: { contains: search as string } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: { product: true, key: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  res.json({ success: true, data: orders });
});

// Get single order
router.get('/:id', async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { product: true, key: true },
  });

  if (!order) {
    res.status(404).json({ success: false, error: 'Orden no encontrada' });
    return;
  }

  res.json({ success: true, data: order });
});

// Approve order
router.post('/:id/approve', async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { product: true },
  });

  if (!order) {
    res.status(404).json({ success: false, error: 'Orden no encontrada' });
    return;
  }

  if (order.status !== 'pending_approval') {
    res.status(400).json({ success: false, error: `La orden esta en estado "${order.status}"` });
    return;
  }

  // Get an available key for key-type products
  let keyId: string | null = null;
  let keyCode: string | null = null;

  if (order.product.type === 'key' || order.product.type === 'both') {
    const key = await prisma.key.findFirst({
      where: { productId: order.productId, status: 'available' },
    });

    if (!key) {
      res.status(400).json({ success: false, error: 'No hay keys disponibles en stock' });
      return;
    }

    keyId = key.id;
    keyCode = key.code;
  }

  // Update order
  await prisma.order.update({
    where: { id: req.params.id },
    data: {
      status: 'delivered',
      approvedAt: new Date(),
      deliveredAt: new Date(),
      ...(keyId ? { key: { connect: { id: keyId } } } : {}),
    },
  });

  // Mark key as sold
  if (keyId) {
    await prisma.key.update({
      where: { id: keyId },
      data: { status: 'sold', usedAt: new Date() },
    });
  }

  // Update/reseller stats + customer
  const customer = await prisma.customer.upsert({
    where: { discordUserId: order.discordUserId },
    update: { totalSpent: { increment: order.amount } },
    create: {
      discordUserId: order.discordUserId,
      discordUsername: order.discordUsername,
      totalSpent: order.amount,
      verified: true,
    },
  });

  await prisma.order.update({
    where: { id: req.params.id },
    data: { customer: { connect: { id: customer.id } } },
  });

  if (order.resellerCode) {
    const reseller = await prisma.reseller.findUnique({ where: { code: order.resellerCode } });
    if (reseller) {
      const commissionAmount = (order.amount * reseller.commission) / 100;
      await prisma.reseller.update({
        where: { id: reseller.id },
        data: {
          totalSales: { increment: 1 },
          totalCommission: { increment: commissionAmount },
        },
      });
    }
  }

  res.json({ success: true, data: { message: 'Venta aprobada y entregada', keyCode } });
});

// Reject order
router.post('/:id/reject', async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });

  if (!order) {
    res.status(404).json({ success: false, error: 'Orden no encontrada' });
    return;
  }

  await prisma.order.update({
    where: { id: req.params.id },
    data: { status: 'rejected' },
  });

  res.json({ success: true, data: { message: 'Venta rechazada' } });
});

// Export orders as CSV
router.get('/export/csv', async (_req: Request, res: Response) => {
  const orders = await prisma.order.findMany({
    include: { product: true, key: true },
    orderBy: { createdAt: 'desc' },
  });

  const header = 'ID,Usuario,Producto,Monto,Metodo,Estado,Codigo Reseller,Key,Fecha\n';
  const rows = orders.map((o) =>
    [
      o.id,
      o.discordUsername,
      o.product.name,
      o.amount,
      o.paymentMethod,
      o.status,
      o.resellerCode || '',
      o.key?.code || '',
      o.createdAt.toISOString(),
    ].join(','),
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
  res.send(header + rows);
});

export default router;
