import {
  Guild,
  ChannelType,
  PermissionsBitField,
  Role,
  CategoryChannel,
  TextChannel,
  VoiceChannel,
} from 'discord.js';

interface SetupConfig {
  categories: { name: string; channels: { name: string; type: ChannelType; topic?: string }[] }[];
  roles: { name: string; color: `#${string}`; permissions: bigint }[];
  permissions: { roleName: string; channelNames: string[]; allow: bigint; deny: bigint }[];
}

export function getDefaultConfig(guild: Guild): SetupConfig {
  const basePerms = PermissionsBitField.Flags;

  return {
    categories: [
      {
        name: 'BIENVENIDA',
        channels: [
          {
            name: 'welcome',
            type: ChannelType.GuildText,
            topic: 'Verificate con /verify para acceder al server',
          },
        ],
      },
      {
        name: 'TIENDA',
        channels: [
          { name: 'reviews', type: ChannelType.GuildText, topic: 'Testimonios de compradores' },
          { name: 'faq', type: ChannelType.GuildText, topic: 'Preguntas frecuentes' },
          {
            name: 'how-to-buy',
            type: ChannelType.GuildText,
            topic: 'Como comprar paso a paso',
          },
          {
            name: 'giveaway',
            type: ChannelType.GuildText,
            topic: 'Sorteos de licencias - usa /giveaway',
          },
        ],
      },
      {
        name: 'COMUNIDAD',
        channels: [
          { name: 'anuncios', type: ChannelType.GuildText, topic: 'Anuncios oficiales' },
          { name: 'public-chat', type: ChannelType.GuildText, topic: 'Chat general' },
          {
            name: 'invite-tracker',
            type: ChannelType.GuildText,
            topic: 'Ranking de invitaciones',
          },
        ],
      },
      {
        name: 'ARK ASA',
        channels: [
          { name: 'cid-info', type: ChannelType.GuildText, topic: 'Informacion del CID' },
          { name: 'cid-soporte', type: ChannelType.GuildText, topic: 'Soporte tecnico CID' },
          { name: 'cid-updates', type: ChannelType.GuildText, topic: 'Changelog del CID' },
        ],
      },
      {
        name: 'STAFF',
        channels: [
          { name: 'staff-chat', type: ChannelType.GuildText, topic: 'Chat interno del staff' },
          { name: 'logs-ventas', type: ChannelType.GuildText, topic: 'Registro de ventas' },
          { name: 'logs-keys', type: ChannelType.GuildText, topic: 'Registro de keys entregadas' },
        ],
      },
    ],
    roles: [
      { name: 'Verificado', color: '#57F287', permissions: basePerms.ViewChannel | basePerms.SendMessages | basePerms.ReadMessageHistory },
      { name: 'Cliente', color: '#5865F2', permissions: basePerms.ViewChannel | basePerms.SendMessages | basePerms.ReadMessageHistory },
      { name: 'CID Owner', color: '#FEE75C', permissions: basePerms.ViewChannel | basePerms.SendMessages | basePerms.ReadMessageHistory },
      { name: 'Reseller', color: '#9B59B6', permissions: basePerms.ViewChannel | basePerms.SendMessages | basePerms.ReadMessageHistory },
      { name: 'Staff', color: '#ED4245', permissions: basePerms.ViewChannel | basePerms.SendMessages | basePerms.ReadMessageHistory | basePerms.KickMembers | basePerms.BanMembers | basePerms.ManageMessages },
      { name: 'Admin', color: '#000000', permissions: basePerms.Administrator },
      { name: 'Bot', color: '#95A5A6', permissions: basePerms.Administrator },
    ],
    permissions: [
      {
        roleName: '@everyone',
        channelNames: ['welcome'],
        allow: basePerms.ViewChannel | basePerms.SendMessages | basePerms.ReadMessageHistory,
        deny: BigInt(0),
      },
      {
        roleName: '@everyone',
        channelNames: [
          'reviews', 'faq', 'how-to-buy', 'giveaway',
          'anuncios', 'public-chat', 'invite-tracker',
          'cid-info', 'cid-soporte', 'cid-updates',
          'staff-chat', 'logs-ventas', 'logs-keys',
        ],
        allow: BigInt(0),
        deny: basePerms.ViewChannel,
      },
      {
        roleName: 'Verificado',
        channelNames: [
          'reviews', 'faq', 'how-to-buy', 'giveaway',
          'anuncios', 'public-chat', 'invite-tracker',
          'cid-info',
        ],
        allow: basePerms.ViewChannel | basePerms.SendMessages | basePerms.ReadMessageHistory,
        deny: BigInt(0),
      },
      {
        roleName: 'CID Owner',
        channelNames: ['cid-soporte', 'cid-updates'],
        allow: basePerms.ViewChannel | basePerms.SendMessages | basePerms.ReadMessageHistory,
        deny: BigInt(0),
      },
      {
        roleName: 'Staff',
        channelNames: ['staff-chat', 'logs-ventas', 'logs-keys'],
        allow: basePerms.ViewChannel | basePerms.SendMessages | basePerms.ReadMessageHistory,
        deny: BigInt(0),
      },
    ],
  };
}

export async function runSetup(guild: Guild): Promise<string> {
  const config = getDefaultConfig(guild);

  // Create roles
  const createdRoles: Map<string, Role> = new Map();
  const botRole = guild.members.me?.roles.botRole;

  for (const roleConfig of config.roles) {
    const existing = guild.roles.cache.find((r) => r.name === roleConfig.name);
    if (!existing) {
      const role = await guild.roles.create({
        name: roleConfig.name,
        color: roleConfig.color as any,
        permissions: roleConfig.permissions,
        reason: 'CID Bot setup',
      });
      createdRoles.set(role.name, role);
    } else {
      createdRoles.set(existing.name, existing);
    }
  }

  // Move bot role to top
  const botRoleObj = createdRoles.get('Bot');
  if (botRoleObj && botRole) {
    try {
      await botRoleObj.setPosition(botRole.position - 1);
    } catch {}
  }

  // Create categories and channels
  for (const cat of config.categories) {
    const existingCat = guild.channels.cache.find(
      (c) => c.type === ChannelType.GuildCategory && c.name === cat.name,
    ) as CategoryChannel;

    let category: CategoryChannel;
    if (!existingCat) {
      category = await guild.channels.create({
        name: cat.name,
        type: ChannelType.GuildCategory,
        reason: 'CID Bot setup',
      });
    } else {
      category = existingCat;
    }

    for (const ch of cat.channels) {
      const existingCh = guild.channels.cache.find(
        (c) => c.name === ch.name && c.parentId === category.id,
      );

      if (!existingCh) {
        await guild.channels.create({
          name: ch.name,
          type: ch.type as ChannelType.GuildText,
          parent: category.id,
          topic: ch.topic,
          reason: 'CID Bot setup',
        });
      }
    }
  }

  // Apply permissions
  for (const perm of config.permissions) {
    const role = createdRoles.get(perm.roleName) || guild.roles.cache.find((r) => r.name === perm.roleName);
    if (!role) continue;

    for (const channelName of perm.channelNames) {
      const channel = guild.channels.cache.find((c) => c.name === channelName);
      if (!channel || !('permissionOverwrites' in channel)) continue;

      const perms = channel.permissionOverwrites;
      await perms.create(role, {
        ViewChannel: null,
        SendMessages: null,
        ReadMessageHistory: null,
      });

      await perms.edit(role, {
        ViewChannel: (perm.allow & PermissionsBitField.Flags.ViewChannel) !== BigInt(0) ? true : (perm.deny & PermissionsBitField.Flags.ViewChannel) !== BigInt(0) ? false : null,
        SendMessages: (perm.allow & PermissionsBitField.Flags.SendMessages) !== BigInt(0) ? true : (perm.deny & PermissionsBitField.Flags.SendMessages) !== BigInt(0) ? false : null,
        ReadMessageHistory: (perm.allow & PermissionsBitField.Flags.ReadMessageHistory) !== BigInt(0) ? true : (perm.deny & PermissionsBitField.Flags.ReadMessageHistory) !== BigInt(0) ? false : null,
      });
    }
  }

  return 'Server configurado correctamente con roles, categorias y canales.';
}
