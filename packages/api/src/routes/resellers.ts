import { Router, Request, Response } from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (_req: Request, res: Response) => {
  const resellers = await prisma.reseller.findMany({ orderBy: { totalCommission: 'desc' } });
  res.json({ success: true, data: resellers });
});

router.post('/', async (req: Request, res: Response) => {
  const { discordUserId, discordUsername, code, commission } = req.body;

  if (!discordUserId || !discordUsername || !code) {
    res.status(400).json({ success: false, error: 'Campos requeridos: discordUserId, discordUsername, code' });
    return;
  }

  const existing = await prisma.reseller.findUnique({ where: { code } });
  if (existing) {
    res.status(409).json({ success: false, error: 'Codigo ya existe' });
    return;
  }

  const reseller = await prisma.reseller.create({
    data: { discordUserId, discordUsername, code, commission: commission || 10 },
  });

  res.status(201).json({ success: true, data: reseller });
});

router.put('/:id', async (req: Request, res: Response) => {
  const updates: Record<string, any> = {};
  const allowed = ['code', 'commission', 'active'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const reseller = await prisma.reseller.update({ where: { id: req.params.id }, data: updates });
  res.json({ success: true, data: reseller });
});

router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.reseller.update({ where: { id: req.params.id }, data: { active: false } });
  res.json({ success: true, data: { message: 'Reseller desactivado' } });
});

export default router;
