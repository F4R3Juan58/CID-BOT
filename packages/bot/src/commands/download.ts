import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../utils/db.js';
import { registerCommand } from '../events/interactionCreate.js';
import { registerDefinition } from '../deploy-commands.js'


const definition = new SlashCommandBuilder()
  .setName('download')
  .setDescription('Obten el link de descarga de un producto comprado')
  .addStringOption((opt) =>
    opt.setName('producto').setDescription('Nombre del producto').setRequired(true).setAutocomplete(true),
  );

async function execute(interaction: ChatInputCommandInteraction) {
  const productName = interaction.options.getString('producto', true);

  const order = await prisma.order.findFirst({
    where: {
      discordUserId: interaction.user.id,
      status: 'delivered',
      product: { name: productName },
    },
    include: { product: true },
  });

  if (!order) {
    await interaction.reply({ content: 'No has comprado este producto o la compra no fue entregada.', ephemeral: true });
    return;
  }

  if (order.product.downloadUrl) {
    await interaction.reply({
      content: `📥 **${order.product.name}** — [Descargar](${order.product.downloadUrl})`,
      ephemeral: true,
    });
  } else {
    await interaction.reply({
      content: 'Este producto no tiene link de descarga. Contacta soporte si necesitas ayuda.',
      ephemeral: true,
    });
  }
}

registerCommand('download', execute);
registerDefinition(definition);
export { definition };
