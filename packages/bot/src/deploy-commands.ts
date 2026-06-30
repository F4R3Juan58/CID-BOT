import { REST, Routes, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, SlashCommandOptionsOnlyBuilder } from 'discord.js';

const definitions: (SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder)[] = [];

export function registerDefinition(def: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder) {
  definitions.push(def);
}

export async function deployCommands(token: string, clientId: string, guildId: string) {
  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log(`Registrando ${definitions.length} slash commands...`);

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: definitions.map((d) => d.toJSON()),
    });

    console.log('Slash commands registrados.');
  } catch (error) {
    console.error('Error registrando slash commands:', error);
  }
}
