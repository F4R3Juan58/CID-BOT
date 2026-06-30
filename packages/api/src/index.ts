import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import customerRoutes from './routes/customers.js';
import resellerRoutes from './routes/resellers.js';
import giveawayRoutes from './routes/giveaways.js';
import serverRoutes from './routes/server.js';
import logRoutes from './routes/logs.js';
import dashboardRoutes from './routes/dashboard.js';
import paypalWebhook from './routes/webhooks/paypal.js';
import stripeWebhook from './routes/webhooks/stripe.js';

const app = express();
const PORT = parseInt(process.env.API_PORT || '3001', 10);

// Stripe webhook needs raw body
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/customers', customerRoutes);
app.use('/resellers', resellerRoutes);
app.use('/giveaways', giveawayRoutes);
app.use('/server-config', serverRoutes);
app.use('/logs', logRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/webhooks/paypal', paypalWebhook);
app.use('/webhooks/stripe', stripeWebhook);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});

export default app;
