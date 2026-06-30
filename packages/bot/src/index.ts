import { deployCommands } from './deploy-commands.js';
import client from './client.js';

// Load all commands (side effects register handlers + definitions)
import './commands/verify.js';
import './commands/buy.js';
import './commands/mykeys.js';
import './commands/download.js';
import './commands/support.js';
import './commands/invite.js';
import './commands/giveaway.js';
import './commands/support-close.js';
import './commands/admin/setup.js';
import './commands/admin/product.js';
import './commands/admin/key.js';
import './commands/admin/giveaway.js';
import './commands/admin/reseller.js';

// Load events
import './events/interactionCreate.js';
import './events/guildMemberAdd.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error('Faltan variables de entorno: DISCORD_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID');
  process.exit(1);
}

client.once('ready', async () => {
  console.log(`Bot conectado como ${client.user?.tag}`);
  await deployCommands(token, clientId, guildId);
});

client.login(token);
