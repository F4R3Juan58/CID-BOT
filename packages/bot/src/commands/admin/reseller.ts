import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../utils/db.js';
import { requireAdmin } from '../../utils/permissions.js';
import { registerCommand } from '../../events/interactionCreate.js';
import { registerDefinition } from '../../deploy-commands.js'


const definition = new SlashCommandBuilder()
  .setName('reseller')
  .setDescription('Administrar resellers')
  .addSubcommand((sub) =>
    sub
      .setName('add')
      .setDescription('Crear codigo de reseller')
      .addUserOption((o) => o.setName('usuario').setDescription('Usuario').setRequired(true))
      .addStringOption((o) => o.setName('codigo').setDescription('Codigo unico').setRequired(true))
      .addNumberOption((o) =>
        o.setName('comision').setDescription('Porcentaje de comision (default 10)').setRequired(false),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('remove')
      .setDescription('Desactivar un reseller')
      .addStringOption((o) => o.setName('codigo').setDescription('Codigo del reseller').setRequired(true)),
  )
  .addSubcommand((sub) =>
    sub.setName('stats').setDescription('Ver estadisticas de un reseller').addStringOption((o) =>
      o.setName('codigo').setDescription('Codigo del reseller').setRequired(true),
    ),
  )
  .addSubcommand((sub) => sub.setName('list').setDescription('Listar todos los resellers'));

async function execute(interaction: ChatInputCommandInteraction) {
  if (!requireAdmin(interaction)) return;

  const sub = interaction.options.getSubcommand();

  if (sub === 'add') {
    const user = interaction.options.getUser('usuario', true);
    const code = interaction.options.getString('codigo', true);
    const commission = interaction.options.getNumber('comision') || 10;

    const existing = await prisma.reseller.findUnique({ where: { code } });
    if (existing) {
      await interaction.reply({ content: 'Ese codigo ya existe.', ephemeral: true });
      return;
    }

    await prisma.reseller.create({
      data: { discordUserId: user.id, discordUsername: user.username, code, commission },
    });

    await interaction.reply({
      content: `✅ Reseller creado: **${user.username}** | Codigo: \`${code}\` | Comision: ${commission}%`,
      ephemeral: true,
    });
  } else if (sub === 'remove') {
    const code = interaction.options.getString('codigo', true);

    await prisma.reseller.updateMany({ where: { code }, data: { active: false } });
    await interaction.reply({ content: `✅ Reseller \`${code}\` desactivado.`, ephemeral: true });
  } else if (sub === 'stats') {
    const code = interaction.options.getString('codigo', true);

    const reseller = await prisma.reseller.findUnique({ where: { code } });
    if (!reseller) {
      await interaction.reply({ content: 'Reseller no encontrado.', ephemeral: true });
      return;
    }

    await interaction.reply({
      content: [
        `## 📊 Reseller: **${reseller.discordUsername}**`,
        `🔑 Codigo: \`${reseller.code}\``,
        `💰 Comision: ${reseller.commission}%`,
        `🛒 Ventas: ${reseller.totalSales}`,
        `💵 Comision acumulada: $${reseller.totalCommission.toFixed(2)}`,
        `✅ Activo: ${reseller.active ? 'Si' : 'No'}`,
      ].join('\n'),
      ephemeral: true,
    });
  } else if (sub === 'list') {
    const resellers = await prisma.reseller.findMany({ orderBy: { totalCommission: 'desc' } });

    if (resellers.length === 0) {
      await interaction.reply({ content: 'No hay resellers registrados.', ephemeral: true });
      return;
    }

    const lines = resellers.map(
      (r, i) =>
        `${i + 1}. **${r.discordUsername}** — \`${r.code}\` — ${r.totalSales} ventas — $${r.totalCommission.toFixed(2)} — ${r.active ? '🟢' : '🔴'}`,
    );

    await interaction.reply({ content: `## 🔗 Resellers\n\n${lines.join('\n')}`, ephemeral: true });
  }
}

registerCommand('reseller', execute);
registerDefinition(definition);
export { definition };
