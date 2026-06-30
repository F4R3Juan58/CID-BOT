import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../utils/db.js';
import { requireStaff } from '../utils/permissions.js';
import { registerCommand } from '../events/interactionCreate.js';
import { registerDefinition } from '../deploy-commands.js'


const definition = new SlashCommandBuilder()
  .setName('support-close')
  .setDescription('Cierra el ticket de soporte actual');

async function execute(interaction: ChatInputCommandInteraction) {
  if (!requireStaff(interaction)) return;

  const channel = interaction.channel;
  if (!channel || !channel.isTextBased()) {
    await interaction.reply({ content: 'Este comando solo funciona en canales de texto.', ephemeral: true });
    return;
  }

  const ticket = await prisma.ticket.findFirst({
    where: { channelId: channel.id, status: 'open' },
  });

  if (!ticket) {
    await interaction.reply({ content: 'Este canal no es un ticket abierto.', ephemeral: true });
    return;
  }

  await prisma.ticket.update({
    where: { id: ticket.id },
    data: { status: 'closed', closedAt: new Date() },
  });

  await interaction.reply('✅ Ticket cerrado. El canal se eliminara en 5 segundos...');

  setTimeout(async () => {
    await channel.delete().catch(() => {});
  }, 5000);
}

registerCommand('support-close', execute);
registerDefinition(definition);
export { definition };
