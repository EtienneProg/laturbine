import 'dotenv/config';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadEvents } from './events/loader';
import { loadCommands } from './commands/loader';
import {startServer} from "./server";

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

client.once('clientReady', () => startServer(client));

client.login(process.env.DISCORD_TOKEN);
