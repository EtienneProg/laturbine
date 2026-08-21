import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { apiService } from '../services/api.service';
import { embedService } from '../services/embed.service';

export const profileCommand = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Affiche ton profil et tes statistiques de la saison en cours'),

    async execute(interaction: ChatInputCommandInteraction) {
        // Restreint la commande à un channel précis
        if (interaction.channelId !== process.env.CHANNEL_PROFILE) {
            await interaction.reply({
                content: `Cette commande n'est utilisable que dans <#${process.env.CHANNEL_PROFILE}>.`,
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply();

        try {
            const profile = await apiService.getPlayerProfileByDiscordId(interaction.user.id);

            if (!profile) {
                await interaction.editReply(
                    "Tu n'as pas encore de profil — inscris-toi à une session pour commencer !"
                );
                return;
            }

            await interaction.editReply(embedService.playerProfile(profile));
        } catch (err) {
            console.error('Erreur /profil:', err);
            await interaction.editReply('Erreur lors de la récupération de ton profil.');
        }
    }
};
