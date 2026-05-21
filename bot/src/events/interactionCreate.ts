import { Interaction } from 'discord.js';
import { BotClient } from '../index';
import { handleRegister } from '../interactions/register';
import { handleUnregister } from '../interactions/unregister';

export function interactionCreateEvent(client: BotClient): void {
    client.on('interactionCreate', async (interaction: Interaction) => {

        // Commandes slash
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (err) {
                console.error(`Erreur commande /${interaction.commandName}:`, err);
                const msg = { content: '❌ Une erreur est survenue.', ephemeral: true };
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(msg);
                } else {
                    await interaction.reply(msg);
                }
            }
            return;
        }

        // Boutons
        if (interaction.isButton()) {
            const [action, ...params] = interaction.customId.split(':');

            try {
                if (action === 'register')   await handleRegister(interaction, params);
                if (action === 'unregister') await handleUnregister(interaction, params);
            } catch (err) {
                console.error(`Erreur bouton ${action}:`, err);
                await interaction.reply({
                    content: '❌ Une erreur est survenue.',
                    ephemeral: true,
                });
            }
        }

    });
}
