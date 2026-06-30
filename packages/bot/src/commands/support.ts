import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ChannelType,
  PermissionsBitField,
} from 'discord.js';
import prisma from '../utils/db.js';
import { registerCommand } from '../events/interactionCreate.js';
import { registerDefinition } from '../deploy-commands.js'

import { ROLES } from '@cid-bot/shared';

const definition = new SlashCommandBuilder()
  .setName('support')
  .setDescription('Crea un ticket de soporte')
  .addStringOption((opt) =>
    opt.setName('motivo').setDescription('Motivo del ticket').setRequired(true),
  );

async function execute(interaction: ChatInputCommandInteraction) {
  const motivo = interaction.options.getString('motivo', true);

  // Check for existing open ticket
  const existing = await prisma.ticket.findFirst({
    where: { discordUserId: interaction.user.id, status: 'open' },
  });

  if (existing) {
    await interaction.reply({ content: 'Ya tienes un ticket abierto. Cierralo antes de crear otro.', ephemeral: true });
    return;
  }

  const guild = interaction.guild!;
  const staffRole = guild.roles.cache.find((r) => r.name === ROLES.STAFF);

  const channel = await guild.channels.create({
    name: `ticket-${interaction.user.username}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
      ...(staffRole
        ? [{ id: staffRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }]
        : []),
    ],
  });

  await prisma.ticket.create({
    data: {
      discordUserId: interaction.user.id,
      discordUsername: interaction.user.username,
      channelId: channel.id,
      reason: motivo,
    },
  });

  await channel.send(`## 🎫 Ticket de Soporte\n**Usuario:** ${interaction.user}\n**Motivo:** ${motivo}\n\nUn <@&${staffRole?.id ?? 'Staff'}> te atendera pronto.`);

  await interaction.reply({ content: `✅ Ticket creado en ${channel}`, ephemeral: true });
}

registerCommand('support', execute);
registerDefinition(definition);
export { definition };
