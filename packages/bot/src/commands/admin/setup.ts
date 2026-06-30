import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { requireAdmin } from '../../utils/permissions.js';
import { runSetup } from '../../services/setup.js';
import { registerCommand } from '../../events/interactionCreate.js';
import { registerDefinition } from '../../deploy-commands.js'


const definition = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Configura el servidor')
  .addSubcommand((sub) => sub.setName('wizard').setDescription('Crea toda la estructura del servidor desde cero'))
  .addSubcommand((sub) => sub.setName('reset').setDescription('BORRA toda la estructura actual (IRREVERSIBLE)'));

async function execute(interaction: ChatInputCommandInteraction) {
  if (!requireAdmin(interaction)) return;

  const sub = interaction.options.getSubcommand();

  if (sub === 'wizard') {
    await interaction.deferReply({ ephemeral: true });
    const result = await runSetup(interaction.guild!);
    await interaction.editReply(`✅ ${result}`);
  } else if (sub === 'reset') {
    await interaction.reply({
      content: '⚠️ ESTO BORRARA TODOS LOS CANALES Y ROLES CREADOS POR EL BOT. Escribe **CONFIRMAR** en este canal en los proximos 30s para continuar.',
      ephemeral: true,
    });

    const channel = interaction.channel;
    if (!channel || !('createMessageCollector' in channel)) {
      await interaction.followUp({ content: 'No se puede usar en este canal.', ephemeral: true });
      return;
    }

    const filter = (m: { author: { id: string } }) => m.author.id === interaction.user.id;
    const collector = channel.createMessageCollector({ filter, time: 30000, max: 1 });

    collector.on('collect', async (m) => {
      if (m.content === 'CONFIRMAR') {
        const guild = interaction.guild!;
        const channels = guild.channels.cache.filter((c) => c.manageable);
        const roles = guild.roles.cache.filter((r) => r.name !== '@everyone' && r.editable);

        for (const [, ch] of channels) await ch.delete().catch(() => {});
        for (const [, role] of roles) await role.delete().catch(() => {});

        await interaction.followUp({ content: '✅ Server reseteado.', ephemeral: true });
      } else {
        await interaction.followUp({ content: 'Reset cancelado.', ephemeral: true });
      }
    });
  }
}

registerCommand('setup', execute);
registerDefinition(definition);
export { definition };
