import { CommandInteraction, GuildMember, PermissionFlagsBits } from 'discord.js';
import { ROLES } from '@cid-bot/shared';

export function isAdmin(member: GuildMember): boolean {
  return member.permissions.has(PermissionFlagsBits.Administrator) || member.roles.cache.some((r) => r.name === ROLES.ADMIN);
}

export function isStaff(member: GuildMember): boolean {
  return isAdmin(member) || member.roles.cache.some((r) => r.name === ROLES.STAFF);
}

export function requireAdmin(interaction: CommandInteraction): boolean {
  const member = interaction.member as GuildMember;
  const isAllowed = isAdmin(member);

  if (!isAllowed) {
    interaction.reply({ content: '❌ No tienes permisos para este comando.', ephemeral: true });
  }

  return isAllowed;
}

export function requireStaff(interaction: CommandInteraction): boolean {
  const member = interaction.member as GuildMember;
  const isAllowed = isStaff(member);

  if (!isAllowed) {
    interaction.reply({ content: '❌ No tienes permisos para este comando.', ephemeral: true });
  }

  return isAllowed;
}
