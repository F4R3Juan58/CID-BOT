import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../utils/db.js';
import { registerCommand } from '../events/interactionCreate.js';
import { registerDefinition } from '../deploy-commands.js'


const definition = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Participa en el sorteo activo');

async function execute(interaction: ChatInputCommandInteraction) {
  const now = new Date();

  const activeGiveaway = await prisma.giveaway.findFirst({
    where: { active: true, startDate: { lte: now }, endDate: { gte: now } },
  });

  if (!activeGiveaway) {
    await interaction.reply({ content: 'No hay sorteos activos en este momento.', ephemeral: true });
    return;
  }

  const alreadyEntered = await prisma.giveawayEntry.findFirst({
    where: { giveawayId: activeGiveaway.id, discordUserId: interaction.user.id },
  });

  if (alreadyEntered) {
    await interaction.reply({ content: 'Ya estas participando en este sorteo.', ephemeral: true });
    return;
  }

  await prisma.giveawayEntry.create({
    data: {
      giveawayId: activeGiveaway.id,
      discordUserId: interaction.user.id,
      discordUsername: interaction.user.username,
    },
  });

  const entryCount = await prisma.giveawayEntry.count({
    where: { giveawayId: activeGiveaway.id },
  });

  await interaction.reply({
    content: `🎉 Te uniste al sorteo **${activeGiveaway.title}**! Participantes: ${entryCount}`,
    ephemeral: true,
  });
}

registerCommand('giveaway', execute);
registerDefinition(definition);
export { definition };
