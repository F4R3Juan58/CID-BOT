import { Router, Request, Response } from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: Request, res: Response) => {
  const { guildId } = req.query;
  if (!guildId) {
    res.status(400).json({ success: false, error: 'guildId requerido' });
    return;
  }

  const configs = await prisma.serverConfig.findMany({
    where: { guildId: guildId as string },
  });

  const result: Record<string, string> = {};
  for (const c of configs) result[c.key] = c.value;

  res.json({ success: true, data: result });
});

router.put('/', async (req: Request, res: Response) => {
  const { guildId, key, value } = req.body;

  if (!guildId || !key) {
    res.status(400).json({ success: false, error: 'guildId y key requeridos' });
    return;
  }

  const config = await prisma.serverConfig.upsert({
    where: { guildId_key: { guildId, key } },
    update: { value },
    create: { guildId, key, value },
  });

  res.json({ success: true, data: config });
});

export default router;
