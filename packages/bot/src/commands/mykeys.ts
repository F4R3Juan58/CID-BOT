import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../utils/db.js';
import { registerCommand } from '../events/interactionCreate.js';
import { registerDefinition } from '../deploy-commands.js';

const definition = new SlashCommandBuilder()
  .setName('mykeys')
  .setDescription('Muestra las keys que has comprado');

async function execute(interaction: ChatInputCommandInteraction) {
  const orders = await prisma.order.findMany({
    where: { discordUserId: interaction.user.id, status: 'delivered', key: { isNot: null } },
    include: { key: true, product: true },
    orderBy: { createdAt: 'desc' },
  });

  if (orders.length === 0) {
    await interaction.reply({ content: 'No tienes keys compradas.', ephemeral: true });
    return;
  }

  const lines = orders.map(
    (o, i) =>
      `${i + 1}. **${o.product.name}** — \`||${o.key!.code}||\` — ${o.deliveredAt ? new Date(o.deliveredAt).toLocaleDateString() : 'N/A'}`,
  );

  await interaction.reply({
    content: `## 🔑 Tus Keys\n\n${lines.join('\n')}`,
    ephemeral: true,
  });
}

registerCommand('mykeys', execute);
registerDefinition(definition);
export { definition };
