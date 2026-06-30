import { Events, GuildMember, TextChannel } from 'discord.js';
import client from '../client.js';
import prisma from '../utils/db.js';
import { CHANNELS } from '@cid-bot/shared';

client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
  try {
    const dmMsg = [
      `## Bienvenido a **${member.guild.name}**`,
      '',
      'Somos una tienda de software. Para comprar y ver los canales, usa `/verify` en el canal #welcome.',
      '',
      'Si necesitas ayuda, usa `/support`.',
    ].join('\n');

    await member.send(dmMsg).catch(() => {});

    // Invite tracking
    const invites = await member.guild.invites.fetch().catch(() => null);
    if (invites) {
      const existingInvite = await prisma.invite.findFirst({
        where: { invitedUserId: member.id },
      });

      if (!existingInvite) {
        const usedInvite = invites.find((inv) => inv.uses !== null && inv.uses > 0);
        if (usedInvite && usedInvite.inviter) {
          await prisma.invite.create({
            data: {
              inviterUserId: usedInvite.inviter.id,
              invitedUserId: member.id,
              invitedUsername: member.user.username,
              code: usedInvite.code,
            },
          });

          const trackerChannel = member.guild.channels.cache.find(
            (c) => c.name === CHANNELS.INVITE_TRACKER,
          ) as TextChannel;

          if (trackerChannel) {
            await trackerChannel.send(
              `📥 **${member.user.username}** fue invitado por **${usedInvite.inviter.username}**`,
            );
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in guildMemberAdd:', error);
  }
});
