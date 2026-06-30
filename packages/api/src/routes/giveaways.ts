import { Router, Request, Response } from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req: Request, res: Response) => {
  const giveaways = await prisma.giveaway.findMany({
    include: { product: true, _count: { select: { entries: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: giveaways });
});

router.post('/', async (req: Request, res: Response) => {
  const { productId, title, winners, durationMinutes } = req.body;

  if (!productId || !title || !winners) {
    res.status(400).json({ success: false, error: 'Campos requeridos: productId, title, winners' });
    return;
  }

  const startDate = new Date();
  const endDate = new Date(Date.now() + (durationMinutes || 60) * 60 * 1000);

  const giveaway = await prisma.giveaway.create({
    data: { productId, title, winners, startDate, endDate },
  });

  res.status(201).json({ success: true, data: giveaway });
});

router.post('/:id/end', async (req: Request, res: Response) => {
  const giveaway = await prisma.giveaway.findUnique({
    where: { id: req.params.id },
    include: { entries: true, product: true },
  });

  if (!giveaway) {
    res.status(404).json({ success: false, error: 'Sorteo no encontrado' });
    return;
  }

  if (!giveaway.active) {
    res.status(400).json({ success: false, error: 'Sorteo ya finalizado' });
    return;
  }

  const entries = giveaway.entries;
  if (entries.length === 0) {
    await prisma.giveaway.update({ where: { id: req.params.id }, data: { active: false } });
    res.json({ success: true, data: { winners: [], message: 'Sin participantes' } });
    return;
  }

  const winnerCount = Math.min(giveaway.winners, entries.length);
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  const winners = shuffled.slice(0, winnerCount);

  await prisma.giveaway.update({ where: { id: req.params.id }, data: { active: false } });

  const deliveredKeys: string[] = [];
  for (const winner of winners) {
    const key = await prisma.key.findFirst({
      where: { productId: giveaway.productId, status: 'available' },
    });

    if (key) {
      await prisma.key.update({ where: { id: key.id }, data: { status: 'sold', usedAt: new Date() } });
      deliveredKeys.push(key.code);
    }
  }

  res.json({
    success: true,
    data: {
      winners: winners.map((w) => ({ discordUserId: w.discordUserId, discordUsername: w.discordUsername })),
      keys: deliveredKeys,
    },
  });
});

export default router;
