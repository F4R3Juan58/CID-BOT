import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../utils/db.js';
import { productEmbed } from '../utils/embeds.js';
import { registerCommand } from '../events/interactionCreate.js';
import { registerDefinition } from '../deploy-commands.js';

const definition = new SlashCommandBuilder()
  .setName('buy')
  .setDescription('Compra un producto')
  .addStringOption((opt) =>
    opt.setName('producto').setDescription('Nombre del producto').setRequired(true).setAutocomplete(true),
  )
  .addStringOption((opt) =>
    opt.setName('reseller').setDescription('Codigo de reseller (opcional)').setRequired(false),
  )
  .addStringOption((opt) =>
    opt.setName('metodo').setDescription('Metodo de pago').setRequired(true).addChoices(
      { name: 'PayPal', value: 'paypal' },
      { name: 'Stripe', value: 'stripe' },
    ),
  );

async function execute(interaction: ChatInputCommandInteraction) {
  const productName = interaction.options.getString('producto', true);
  const resellerCode = interaction.options.getString('reseller') || undefined;
  const metodo = interaction.options.getString('metodo', true) as 'paypal' | 'stripe';

  const product = await prisma.product.findFirst({
    where: { name: productName, active: true },
  });

  if (!product) {
    await interaction.reply({ content: 'Producto no encontrado o inactivo.', ephemeral: true });
    return;
  }

  // Validate reseller code
  if (resellerCode) {
    const reseller = await prisma.reseller.findUnique({ where: { code: resellerCode } });
    if (!reseller || !reseller.active) {
      await interaction.reply({ content: 'Codigo de reseller invalido.', ephemeral: true });
      return;
    }
    if (reseller.discordUserId === interaction.user.id) {
      await interaction.reply({ content: 'No puedes usar tu propio codigo de reseller.', ephemeral: true });
      return;
    }
  }

  // Create pending order
  const order = await prisma.order.create({
    data: {
      discordUserId: interaction.user.id,
      discordUsername: interaction.user.username,
      productId: product.id,
      amount: product.price,
      paymentMethod: metodo,
      status: 'pending_payment',
      resellerCode,
    },
  });

  // In a real app, you'd generate a payment link here via Stripe/PayPal API
  // For now, we simulate the flow
  const paymentLink =
    metodo === 'paypal'
      ? `https://paypal.me/tuuser/${product.price}?order=${order.id}`
      : `https://buy.stripe.com/placeholder?order=${order.id}`;

  await interaction.reply({
    content: [
      `## 🛒 Compra: **${product.name}**`,
      '',
      `💰 **Precio:** $${product.price.toFixed(2)}`,
      `🔗 **Link de pago (${metodo === 'paypal' ? 'PayPal' : 'Stripe'}):**`,
      paymentLink,
      '',
      'Una vez que pagues, la compra quedara pendiente de aprobacion. Recibiras tu key por DM.',
      `📦 Order ID: \`${order.id}\``,
    ].join('\n'),
    ephemeral: true,
  });
}

registerCommand('buy', execute);
registerDefinition(definition);
export { definition };
