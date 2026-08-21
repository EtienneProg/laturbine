import { REST, Routes } from 'discord.js';
import { pingCommand } from './commands/ping';
import { leaderboardCommand } from './commands/leaderboard';
import {profileCommand} from "./commands/profile";

const commands = [
    pingCommand.data.toJSON(),
    leaderboardCommand.data.toJSON(),
    profileCommand.data.toJSON(),
];

export async function deployCommands(): Promise<void> {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    try {
        console.log('🔄 Déploiement des commandes slash...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.DISCORD_CLIENT_ID!,
                process.env.DISCORD_GUILD_ID!,
            ),
            { body: commands },
        );

        console.log(`✅ ${commands.length} commande(s) déployée(s) avec succès !`);
    } catch (err) {
        console.error('❌ Erreur lors du déploiement des commandes:', err);
    }
}

// Permet de continuer à l'exécuter manuellement : npx ts-node src/deploy-commands.ts
if (require.main === module) {
    void deployCommands();
}
