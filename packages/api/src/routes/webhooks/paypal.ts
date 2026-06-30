import { Router, Request, Response } from 'express';
import prisma from '../../utils/db.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // PayPal sends payment data in different formats depending on IPN vs REST
    // For simplicity, we look for a custom order ID in the transaction
    const orderId = body.resource?.custom_id || body.custom || body.invoice;

    if (!orderId) {
      console.log('PayPal webhook: no order ID found in payload');
      res.status(200).send('OK');
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.log('PayPal webhook: order not found:', orderId);
      res.status(200).send('OK');
      return;
    }

    if (order.status === 'pending_payment') {
      const eventType = body.event_type;

      if (eventType === 'PAYMENT.CAPTURE.COMPLETED' || eventType === 'CHECKOUT.ORDER.APPROVED') {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: 'pending_approval',
            paymentId: body.resource?.id || body.id || undefined,
          },
        });
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).send('Error');
  }
});

export default router;
