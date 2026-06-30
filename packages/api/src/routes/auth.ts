import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../utils/db.js';
import { generateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Username y password requeridos' });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { username } });

  if (!admin) {
    res.status(401).json({ success: false, error: 'Credenciales invalidas' });
    return;
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    res.status(401).json({ success: false, error: 'Credenciales invalidas' });
    return;
  }

  const token = generateToken(username);
  res.json({ success: true, data: { token } });
});

router.post('/setup', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ success: false, error: 'Username y password requeridos' });
    return;
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    res.status(400).json({ success: false, error: 'Admin ya configurado. Usa /login.' });
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.admin.create({ data: { username, password: hash } });

  res.json({ success: true, data: { message: 'Admin creado. Inicia sesion con /login.' } });
});

export default router;
