import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { registerCommand } from '../events/interactionCreate.js';
import { registerDefinition } from '../deploy-commands.js'


const definition = new SlashCommandBuilder()
  .setName('invite')
  .setDescription('Obten tu link de invitacion personalizado');

async function execute(interaction: ChatInputCommandInteraction) {
  const guild = interaction.guild!;

  const invites = await guild.invites.fetch().catch(() => null);
  const userInvite = invites?.find((inv) => inv.inviter?.id === interaction.user.id);

  if (userInvite) {
    await interaction.reply({
      content: `🔗 Tu link de invitacion: https://discord.gg/${userInvite.code}\nUsos: ${userInvite.uses ?? 0}`,
      ephemeral: true,
    });
  } else {
    const channel = guild.channels.cache.find((c) => c.name === 'welcome');
    if (channel) {
      const newInvite = await guild.invites.create(channel.id, {
        maxAge: 0,
        maxUses: 0,
        unique: true,
        reason: `Invitacion personal para ${interaction.user.username}`,
      });

      await interaction.reply({
        content: `🔗 Tu link de invitacion: https://discord.gg/${newInvite.code}`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({ content: 'No se pudo generar invitacion.', ephemeral: true });
    }
  }
}

registerCommand('invite', execute);
registerDefinition(definition);
export { definition };
