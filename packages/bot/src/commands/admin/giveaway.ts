import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../utils/db.js';
import { requireAdmin } from '../../utils/permissions.js';
import { registerCommand } from '../../events/interactionCreate.js';
import { registerDefinition } from '../../deploy-commands.js'


const definition = new SlashCommandBuilder()
  .setName('giveaway-admin')
  .setDescription('Administrar sorteos')
  .addSubcommand((sub) =>
    sub
      .setName('create')
      .setDescription('Crear un sorteo')
      .addStringOption((o) => o.setName('titulo').setDescription('Titulo del sorteo').setRequired(true))
      .addStringOption((o) =>
        o.setName('producto').setDescription('Slug del producto a sortear').setRequired(true),
      )
      .addIntegerOption((o) =>
        o.setName('ganadores').setDescription('Cantidad de ganadores').setRequired(true),
      )
      .addIntegerOption((o) =>
        o
          .setName('duracion')
          .setDescription('Duracion en minutos')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('end')
      .setDescription('Finalizar un sorteo y elegir ganadores')
      .addStringOption((o) =>
        o.setName('id').setDescription('ID del sorteo').setRequired(true),
      ),
  );

async function execute(interaction: ChatInputCommandInteraction) {
  if (!requireAdmin(interaction)) return;

  const sub = interaction.options.getSubcommand();

  if (sub === 'create') {
    const title = interaction.options.getString('titulo', true);
    const productSlug = interaction.options.getString('producto', true);
    const winners = interaction.options.getInteger('ganadores', true);
    const durationMin = interaction.options.getInteger('duracion', true);

    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) {
      await interaction.reply({ content: 'Producto no encontrado.', ephemeral: true });
      return;
    }

    const startDate = new Date();
    const endDate = new Date(Date.now() + durationMin * 60 * 1000);

    const giveaway = await prisma.giveaway.create({
      data: { productId: product.id, title, winners, startDate, endDate },
    });

    // Announce in giveaway channel
    const giveawayChannel = interaction.guild?.channels.cache.find((c) => c.name === 'giveaway');
    if (giveawayChannel?.isTextBased()) {
      await giveawayChannel.send({
        content: [
          `## 🎉 **${title}**`,
          '',
          `🏆 Premio: **${product.name}** (${winners} ganador${winners > 1 ? 'es' : ''})`,
          `⏰ Termina: <t:${Math.floor(endDate.getTime() / 1000)}:R>`,
          '',
          'Usa `/giveaway` para participar!',
        ].join('\n'),
      });
    }

    await interaction.reply({
      content: `✅ Sorteo creado: **${title}** (ID: \`${giveaway.id}\`)`,
      ephemeral: true,
    });
  } else if (sub === 'end') {
    const giveawayId = interaction.options.getString('id', true);
    const giveaway = await prisma.giveaway.findUnique({
      where: { id: giveawayId },
      include: { entries: true, product: true },
    });

    if (!giveaway) {
      await interaction.reply({ content: 'Sorteo no encontrado.', ephemeral: true });
      return;
    }

    if (!giveaway.active) {
      await interaction.reply({ content: 'Este sorteo ya fue finalizado.', ephemeral: true });
      return;
    }

    const entries = giveaway.entries;
    if (entries.length === 0) {
      await prisma.giveaway.update({ where: { id: giveawayId }, data: { active: false } });
      await interaction.reply({ content: 'Sorteo finalizado sin participantes.', ephemeral: true });
      return;
    }

    const winnerCount = Math.min(giveaway.winners, entries.length);
    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, winnerCount);

    await prisma.giveaway.update({ where: { id: giveawayId }, data: { active: false } });

    // Deliver keys to winners
    for (const winner of winners) {
      const key = await prisma.key.findFirst({
        where: { productId: giveaway.productId, status: 'available' },
      });

      if (key) {
        await prisma.key.update({ where: { id: key.id }, data: { status: 'sold', usedAt: new Date() } });

        const member = await interaction.guild?.members.fetch(winner.discordUserId).catch(() => null);
        if (member) {
          await member.send(`🎉 Ganaste **${giveaway.product.name}**!\n🔑 Key: ||\`${key.code}\`||`).catch(() => {});
        }
      }
    }

    const winnerMentions = winners.map((w) => `<@${w.discordUserId}>`).join(', ');

    const giveawayChannel = interaction.guild?.channels.cache.find((c) => c.name === 'giveaway');
    if (giveawayChannel?.isTextBased()) {
      await giveawayChannel.send(`🎉 **${giveaway.title}** finalizado!\nGanador${winnerCount > 1 ? 'es' : ''}: ${winnerMentions}`);
    }

    await interaction.reply({
      content: `✅ Sorteo finalizado. Ganador${winnerCount > 1 ? 'es' : ''}: ${winnerMentions}`,
      ephemeral: true,
    });
  }
}

registerCommand('giveaway-admin', execute);
registerDefinition(definition);
export { definition };
