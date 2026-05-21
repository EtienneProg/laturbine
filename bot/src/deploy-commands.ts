import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { pingCommand } from './commands/ping';
import { leaderboardCommand } from './commands/leaderboard';
import { messtatsCommand } from './commands/messtats';

const commands = [
    pingCommand.data.toJSON(),
    leaderboardCommand.data.toJSON(),
    messtatsCommand.data.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
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
        console.error('❌ Erreur lors du déploiement:', err);
    }
})();
