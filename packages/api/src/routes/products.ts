import { Router, Request, Response } from 'express';
import prisma from '../utils/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

// List all products
router.get('/', async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ success: true, data: products });
});

// Get single product
router.get('/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) {
    res.status(404).json({ success: false, error: 'Producto no encontrado' });
    return;
  }
  res.json({ success: true, data: product });
});

// Create product
router.post('/', async (req: Request, res: Response) => {
  const { name, slug, description, price, type, imageUrl, downloadUrl, roleName } = req.body;

  if (!name || !slug || !price || !type) {
    res.status(400).json({ success: false, error: 'Campos requeridos: name, slug, price, type' });
    return;
  }

  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) {
    res.status(409).json({ success: false, error: 'Slug ya existe' });
    return;
  }

  const product = await prisma.product.create({
    data: { name, slug, description: description || '', price, type, imageUrl, downloadUrl, roleName },
  });

  res.status(201).json({ success: true, data: product });
});

// Update product
router.put('/:id', async (req: Request, res: Response) => {
  const updates: Record<string, any> = {};
  const allowed = ['name', 'slug', 'description', 'price', 'type', 'imageUrl', 'downloadUrl', 'roleName', 'active'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const product = await prisma.product.update({ where: { id: req.params.id }, data: updates });
  res.json({ success: true, data: product });
});

// Delete product
router.delete('/:id', async (req: Request, res: Response) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.json({ success: true, data: { message: 'Producto eliminado' } });
});

// Get keys for a product
router.get('/:id/keys', async (req: Request, res: Response) => {
  const { status } = req.query;
  const keys = await prisma.key.findMany({
    where: { productId: req.params.id, ...(status ? { status: status as string } : {}) },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: keys });
});

// Add keys to product
router.post('/:id/keys', async (req: Request, res: Response) => {
  const { codes } = req.body; // string[]

  if (!codes || !Array.isArray(codes) || codes.length === 0) {
    res.status(400).json({ success: false, error: 'codes debe ser un array no vacio' });
    return;
  }

  let added = 0;
  let skipped = 0;

  for (const code of codes) {
    try {
      await prisma.key.create({ data: { code, productId: req.params.id } });
      added++;
    } catch {
      skipped++;
    }
  }

  res.json({ success: true, data: { added, skipped } });
});

export default router;
