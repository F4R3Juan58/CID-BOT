import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../utils/db.js';
import { requireAdmin } from '../../utils/permissions.js';
import { registerCommand } from '../../events/interactionCreate.js';
import { registerDefinition } from '../../deploy-commands.js'


const definition = new SlashCommandBuilder()
  .setName('key')
  .setDescription('Administrar keys de productos')
  .addSubcommand((sub) =>
    sub
      .setName('add')
      .setDescription('Agregar una key')
      .addStringOption((o) => o.setName('producto').setDescription('Slug del producto').setRequired(true))
      .addStringOption((o) => o.setName('codigo').setDescription('Codigo de la key').setRequired(true)),
  )
  .addSubcommand((sub) =>
    sub
      .setName('bulk')
      .setDescription('Agregar keys desde un archivo TXT/CSV (una por linea)')
      .addStringOption((o) => o.setName('producto').setDescription('Slug del producto').setRequired(true))
      .addAttachmentOption((o) => o.setName('archivo').setDescription('Archivo .txt o .csv con keys').setRequired(true)),
  )
  .addSubcommand((sub) =>
    sub.setName('stock').setDescription('Ver stock de keys de un producto').addStringOption((o) =>
      o.setName('producto').setDescription('Slug del producto').setRequired(true),
    ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('revoke')
      .setDescription('Revocar una key')
      .addStringOption((o) => o.setName('codigo').setDescription('Codigo de la key').setRequired(true)),
  );

async function execute(interaction: ChatInputCommandInteraction) {
  if (!requireAdmin(interaction)) return;

  const sub = interaction.options.getSubcommand();

  if (sub === 'add') {
    const productSlug = interaction.options.getString('producto', true);
    const code = interaction.options.getString('codigo', true);

    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) {
      await interaction.reply({ content: 'Producto no encontrado.', ephemeral: true });
      return;
    }

    await prisma.key.create({ data: { code, productId: product.id } });
    await interaction.reply({ content: `✅ Key agregada a **${product.name}**.`, ephemeral: true });
  } else if (sub === 'bulk') {
    const productSlug = interaction.options.getString('producto', true);
    const attachment = interaction.options.getAttachment('archivo', true);

    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) {
      await interaction.reply({ content: 'Producto no encontrado.', ephemeral: true });
      return;
    }

    const response = await fetch(attachment.url);
    const text = await response.text();
    const codes = text.split(/[\r\n]+/).map((l) => l.trim()).filter((l) => l.length > 0);

    let added = 0;
    let skipped = 0;
    for (const code of codes) {
      try {
        await prisma.key.create({ data: { code, productId: product.id } });
        added++;
      } catch {
        skipped++;
      }
    }

    await interaction.reply({
      content: `✅ Keys agregadas a **${product.name}**: ${added} agregadas, ${skipped} duplicadas.`,
      ephemeral: true,
    });
  } else if (sub === 'stock') {
    const productSlug = interaction.options.getString('producto', true);

    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (!product) {
      await interaction.reply({ content: 'Producto no encontrado.', ephemeral: true });
      return;
    }

    const [available, sold, revoked] = await Promise.all([
      prisma.key.count({ where: { productId: product.id, status: 'available' } }),
      prisma.key.count({ where: { productId: product.id, status: 'sold' } }),
      prisma.key.count({ where: { productId: product.id, status: 'revoked' } }),
    ]);

    await interaction.reply({
      content: `## 📦 Stock: **${product.name}**\n🟢 Disponibles: ${available}\n🔵 Vendidas: ${sold}\n🔴 Revocadas: ${revoked}`,
      ephemeral: true,
    });
  } else if (sub === 'revoke') {
    const code = interaction.options.getString('codigo', true);

    const key = await prisma.key.findUnique({ where: { code } });
    if (!key) {
      await interaction.reply({ content: 'Key no encontrada.', ephemeral: true });
      return;
    }

    await prisma.key.update({ where: { id: key.id }, data: { status: 'revoked' } });

    await interaction.reply({ content: `✅ Key revocada: \`...${code.slice(-4)}\``, ephemeral: true });
  }
}

registerCommand('key', execute);
registerDefinition(definition);
export { definition };
