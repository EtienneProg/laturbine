import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadEvents } from './events/loader';
import { loadCommands } from './commands/loader';
import { deployCommands } from './deploy-commands';
import { startServer } from './server';

export interface BotClient extends Client {
    commands: Collection<string, any>;
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
}) as BotClient;

client.commands = new Collection();

// Chargement des events et commandes
loadEvents(client);
loadCommands(client);

client.once('clientReady', async () => {
    // Enregistre/synchronise les commandes slash auprès de Discord
    await deployCommands();

    startServer(client);
});

client.login(process.env.DISCORD_TOKEN);
