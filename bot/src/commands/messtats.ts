import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { apiService } from '../services/api.service';

export const messtatsCommand = {
    data: new SlashCommandBuilder()
        .setName('messtats')
        .setDescription('Affiche tes statistiques ELO'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const player = await apiService.getPlayerByDiscordId(interaction.user.id) as any;

            const total   = player.wins + player.losses;
            const winRate = total === 0 ? '—' : `${Math.round((player.wins / total) * 100)}%`;

            const rankLabel =
                player.elo >= 2000 ? '👑 Légende' :
                    player.elo >= 1800 ? '💎 Elite'   :
                        player.elo >= 1650 ? '🔥 Pro'     :
                            player.elo >= 1500 ? '⚡ Confirmé' :
                                player.elo >= 1350 ? '🎯 Intermédiaire' :
                                    '🌱 Débutant';

            const embed = new EmbedBuilder()
                .setTitle(`📊 Stats de ${player.name}`)
                .addFields(
                    { name: '🏅 Rang',      value: `#${player.rank}`,   inline: true },
                    { name: '⚡ ELO',       value: `${player.elo}`,     inline: true },
                    { name: '🎖️ Niveau',    value: rankLabel,            inline: true },
                    { name: '🏆 Victoires', value: `${player.wins}`,    inline: true },
                    { name: '💀 Défaites',  value: `${player.losses}`,  inline: true },
                    { name: '📈 Win Rate',  value: winRate,              inline: true },
                )
                .setColor(0x00f5ff)
                .setFooter({ text: 'La Turbine — Laser Game' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch {
            await interaction.editReply({
                content: '❌ Ton compte Discord n\'est pas lié à un joueur. Contacte un admin !',
            });
        }
    },
};
