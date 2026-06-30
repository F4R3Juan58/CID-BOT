import { Router, Request, Response } from 'express';
import prisma from '../../utils/db.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const event = req.body;

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.client_reference_id || session.metadata?.orderId;

      if (!orderId) {
        console.log('Stripe webhook: no order ID in session');
        res.status(200).json({ received: true });
        return;
      }

      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        console.log('Stripe webhook: order not found:', orderId);
        res.status(200).json({ received: true });
        return;
      }

      if (order.status === 'pending_payment' && session.payment_status === 'paid') {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'pending_approval',
            paymentId: session.payment_intent || session.id,
          },
        });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).send('Error');
  }
});

export default router;
