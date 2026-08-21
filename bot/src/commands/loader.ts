import { BotClient } from '../index';
import { pingCommand } from './ping';
import { leaderboardCommand } from './leaderboard';
import { profileCommand } from "./profile";

const commands = [pingCommand, leaderboardCommand, profileCommand];

export function loadCommands(client: BotClient): void {
    for (const command of commands) {
        client.commands.set(command.data.name, command);
        console.log(`✅ Commande chargée : /${command.data.name}`);
    }
}
