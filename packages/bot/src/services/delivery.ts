import prisma from '../utils/db.js';
import { ROLES } from '@cid-bot/shared';
import type { Client, TextChannel } from 'discord.js';

export async function approveAndDeliver(
  orderId: string,
  client: Client,
): Promise<{ success: boolean; message: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { product: true },
  });

  if (!order) return { success: false, message: 'Orden no encontrada.' };
  if (order.status !== 'pending_approval') {
    return { success: false, message: `La orden esta en estado "${order.status}", no "pending_approval".` };
  }

  // Get an available key for key-type products
  let key: { id: string; code: string } | null = null;
  if (order.product.type === 'key' || order.product.type === 'both') {
    key = await prisma.key.findFirst({
      where: { productId: order.productId, status: 'available' },
    });

    if (!key) {
      return { success: false, message: 'No hay keys disponibles en stock. Agrega keys antes de aprobar.' };
    }
  }

  // Update order status and link key
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'delivered',
      approvedAt: new Date(),
      deliveredAt: new Date(),
      key: key ? { connect: { id: key.id } } : undefined,
    },
  });

  // Mark key as sold
  if (key) {
    await prisma.key.update({
      where: { id: key.id },
      data: { status: 'sold', orderId: orderId, usedAt: new Date() },
    });
  }

  // Update customer
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

  // Link order to customer
  if (customer) {
    await prisma.order.update({
      where: { id: orderId },
      data: { customer: { connect: { id: customer.id } } },
    });
  }

  // Try to deliver via DM and assign roles
  const guild = client.guilds.cache.first();
  if (guild) {
    try {
      const member = await guild.members.fetch(order.discordUserId);
      const deliveryMsg = [
        `## ✅ Compra Aprobada - ${order.product.name}`,
        '',
        `Gracias por tu compra, **${order.discordUsername}**!`,
      ];

      if (key) {
        deliveryMsg.push(`🔑 **Tu key:** ||\`${key.code}\`||`);
      }
      if (order.product.downloadUrl) {
        deliveryMsg.push(`📥 **Descarga:** ${order.product.downloadUrl}`);
      }
      deliveryMsg.push('', 'Usa `/mykeys` para ver tus keys en cualquier momento.');
      deliveryMsg.push('Usa `/download` para obtener el link de descarga.');

      await member.send(deliveryMsg.join('\n')).catch(() => {});

      // Assign roles
      const clienteRole = guild.roles.cache.find((r) => r.name === ROLES.CLIENTE);
      if (clienteRole) {
        await member.roles.add(clienteRole).catch(() => {});
      }

      if (order.product.roleName) {
        const productRole = guild.roles.cache.find((r) => r.name === order.product.roleName);
        if (productRole) {
          await member.roles.add(productRole).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Delivery error:', e);
    }
  }

  // Update reseller stats
  if (order.resellerCode) {
    const reseller = await prisma.reseller.findUnique({
      where: { code: order.resellerCode },
    });

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

  // Log to staff channel
  if (guild) {
    const logsChannel = guild.channels.cache.find((c) => c.name === 'logs-ventas') as TextChannel;
    if (logsChannel) {
      const keyPreview = key ? `\`...${key.code.slice(-4)}\`` : 'N/A';
      await logsChannel.send(
        `✅ **Venta aprobada** | ${order.discordUsername} compro **${order.product.name}** por $${order.amount.toFixed(2)} | Key: ${keyPreview}`,
      );
    }
  }

  return { success: true, message: 'Venta aprobada y entregada.' };
}

export async function rejectOrder(
  orderId: string,
): Promise<{ success: boolean; message: string }> {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) return { success: false, message: 'Orden no encontrada.' };
  if (order.status !== 'pending_approval') {
    return { success: false, message: 'La orden no esta pendiente de aprobacion.' };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'rejected' },
  });

  return { success: true, message: 'Venta rechazada.' };
}
