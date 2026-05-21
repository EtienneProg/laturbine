import { BotClient } from '../index';
import { pingCommand } from './ping';
import { leaderboardCommand } from './leaderboard';
import { messtatsCommand } from './messtats';

const commands = [pingCommand, leaderboardCommand, messtatsCommand];

export function loadCommands(client: BotClient): void {
    for (const command of commands) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Commande chargée : /${command.data.name}`);
    }
}
