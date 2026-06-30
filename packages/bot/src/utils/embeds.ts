import { EmbedBuilder, ColorResolvable } from 'discord.js';

export const COLORS = {
  primary: '#5865F2' as ColorResolvable,
  success: '#57F287' as ColorResolvable,
  danger: '#ED4245' as ColorResolvable,
  warning: '#FEE75C' as ColorResolvable,
  info: '#5865F2' as ColorResolvable,
};

export function createEmbed(title: string, description: string, color: ColorResolvable = COLORS.primary) {
  return new EmbedBuilder().setTitle(title).setDescription(description).setColor(color).setTimestamp();
}

export function successEmbed(title: string, description: string) {
  return createEmbed(title, description, COLORS.success);
}

export function errorEmbed(title: string, description: string) {
  return createEmbed(`❌ ${title}`, description, COLORS.danger);
}

export function productEmbed(product: {
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  type: string;
}) {
  const embed = new EmbedBuilder()
    .setTitle(product.name)
    .setDescription(product.description)
    .setColor(COLORS.primary)
    .addFields(
      { name: 'Precio', value: `$${product.price.toFixed(2)}`, inline: true },
      { name: 'Tipo', value: product.type === 'key' ? 'Licencia (Key)' : product.type === 'download' ? 'Descarga' : 'Key + Descarga', inline: true },
    )
    .setFooter({ text: 'Usa /buy para comprar' })
    .setTimestamp();

  if (product.imageUrl) {
    embed.setImage(product.imageUrl);
  }

  return embed;
}
