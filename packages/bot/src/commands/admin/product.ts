import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../../utils/db.js';
import { requireAdmin } from '../../utils/permissions.js';
import { productEmbed } from '../../utils/embeds.js';
import { registerCommand } from '../../events/interactionCreate.js';
import { registerDefinition } from '../../deploy-commands.js'


const definition = new SlashCommandBuilder()
  .setName('product')
  .setDescription('Administrar productos del catalogo')
  .addSubcommand((sub) =>
    sub
      .setName('add')
      .setDescription('Agregar un producto')
      .addStringOption((o) => o.setName('nombre').setDescription('Nombre').setRequired(true))
      .addStringOption((o) => o.setName('slug').setDescription('Slug unico').setRequired(true))
      .addStringOption((o) => o.setName('descripcion').setDescription('Descripcion').setRequired(true))
      .addNumberOption((o) => o.setName('precio').setDescription('Precio en USD').setRequired(true))
      .addStringOption((o) =>
        o.setName('tipo').setDescription('Tipo de producto').setRequired(true).addChoices(
          { name: 'Key', value: 'key' },
          { name: 'Descarga', value: 'download' },
          { name: 'Key + Descarga', value: 'both' },
        ),
      )
      .addStringOption((o) => o.setName('imagen').setDescription('URL de la imagen').setRequired(false))
      .addStringOption((o) => o.setName('descarga').setDescription('URL de descarga').setRequired(false))
      .addStringOption((o) => o.setName('rol').setDescription('Rol a asignar al comprar').setRequired(false)),
  )
  .addSubcommand((sub) =>
    sub
      .setName('edit')
      .setDescription('Editar un producto')
      .addStringOption((o) => o.setName('slug').setDescription('Slug del producto').setRequired(true))
      .addStringOption((o) => o.setName('nombre').setDescription('Nuevo nombre').setRequired(false))
      .addStringOption((o) => o.setName('descripcion').setDescription('Nueva descripcion').setRequired(false))
      .addNumberOption((o) => o.setName('precio').setDescription('Nuevo precio').setRequired(false))
      .addBooleanOption((o) => o.setName('activo').setDescription('Activo/Inactivo').setRequired(false)),
  )
  .addSubcommand((sub) => sub.setName('list').setDescription('Listar productos activos'));

async function execute(interaction: ChatInputCommandInteraction) {
  if (!requireAdmin(interaction)) return;

  const sub = interaction.options.getSubcommand();

  if (sub === 'add') {
    const data = {
      name: interaction.options.getString('nombre', true),
      slug: interaction.options.getString('slug', true),
      description: interaction.options.getString('descripcion', true),
      price: interaction.options.getNumber('precio', true),
      type: interaction.options.getString('tipo', true),
      imageUrl: interaction.options.getString('imagen'),
      downloadUrl: interaction.options.getString('descarga'),
      roleName: interaction.options.getString('rol'),
    };

    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      await interaction.reply({ content: 'Ya existe un producto con ese slug.', ephemeral: true });
      return;
    }

    const product = await prisma.product.create({ data: data as any });

    await interaction.reply({
      content: `✅ Producto **${product.name}** creado.`,
      embeds: [productEmbed(product)],
      ephemeral: true,
    });
  } else if (sub === 'edit') {
    const slug = interaction.options.getString('slug', true);
    const updates: Record<string, any> = {};

    const nombre = interaction.options.getString('nombre');
    const descripcion = interaction.options.getString('descripcion');
    const precio = interaction.options.getNumber('precio');
    const activo = interaction.options.getBoolean('activo');

    if (nombre) updates.name = nombre;
    if (descripcion) updates.description = descripcion;
    if (precio !== null) updates.price = precio;
    if (activo !== null) updates.active = activo;

    const product = await prisma.product.update({ where: { slug }, data: updates });

    await interaction.reply({
      content: `✅ Producto **${product.name}** actualizado.`,
      ephemeral: true,
    });
  } else if (sub === 'list') {
    const products = await prisma.product.findMany({ where: { active: true } });

    if (products.length === 0) {
      await interaction.reply({ content: 'No hay productos activos.', ephemeral: true });
      return;
    }

    await interaction.reply({
      embeds: products.map((p) => productEmbed(p)),
      ephemeral: true,
    });
  }
}

registerCommand('product', execute);
registerDefinition(definition);
export { definition };
