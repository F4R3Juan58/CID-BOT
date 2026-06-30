import { Events, ChatInputCommandInteraction } from 'discord.js';
import client from '../client.js';

type CommandHandler = (interaction: ChatInputCommandInteraction) => Promise<void>;
const commands = new Map<string, CommandHandler>();

export function registerCommand(name: string, handler: CommandHandler) {
  commands.set(name, handler);
}

export function getCommand(name: string): CommandHandler | undefined {
  return commands.get(name);
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const handler = commands.get(interaction.commandName);
  if (!handler) {
    await interaction.reply({ content: 'Comando no encontrado.', ephemeral: true });
    return;
  }

  try {
    await handler(interaction);
  } catch (error) {
    console.error(`Error executing /${interaction.commandName}:`, error);
    const payload = { content: 'Ocurrio un error al ejecutar el comando.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
});
