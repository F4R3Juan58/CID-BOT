import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { ROLES } from '@cid-bot/shared';
import { registerCommand } from '../events/interactionCreate.js';
import { registerDefinition } from '../deploy-commands.js';

const definition = new SlashCommandBuilder()
  .setName('verify')
  .setDescription('Verificate para acceder al servidor');

async function execute(interaction: ChatInputCommandInteraction) {
  const member = interaction.guild!.members.cache.get(interaction.user.id);
  if (!member) {
    await interaction.reply({ content: 'No se pudo encontrar tu miembro.', ephemeral: true });
    return;
  }

  const role = interaction.guild!.roles.cache.find((r) => r.name === ROLES.VERIFICADO);
  if (!role) {
    await interaction.reply({ content: 'Rol Verificado no encontrado. Contacta a un admin.', ephemeral: true });
    return;
  }

  if (member.roles.cache.has(role.id)) {
    await interaction.reply({ content: 'Ya estas verificado.', ephemeral: true });
    return;
  }

  await member.roles.add(role);
  await interaction.reply({ content: '✅ Verificado! Ya puedes ver todos los canales.', ephemeral: true });
}

registerCommand('verify', execute);
registerDefinition(definition);
export { definition };
