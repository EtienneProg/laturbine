import {
    SlashCommandBuilder, ChatInputCommandInteraction,
    ButtonInteraction, ComponentType, Message,
} from 'discord.js';
import { apiService } from '../services/api.service';
import { embedService } from '../services/embed.service';

const PAGE_SIZE = 10;

export const leaderboardCommand = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Affiche le classement ELO'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        const players    = await apiService.getLeaderboard() as any[];
        const totalPages = Math.max(1, Math.ceil(players.length / PAGE_SIZE));
        let   page       = 1;

        const getPage = (p: number) => {
            const slice = players.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
            return embedService.leaderboard(slice, p, totalPages);
        };

        const msg = await interaction.editReply(getPage(page)) as Message;

        // Collector pour la pagination
        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60_000, // 1 minute
        });

        collector.on('collect', async (btn: ButtonInteraction) => {
            if (btn.user.id !== interaction.user.id) {
                await btn.reply({ content: '❌ Ce n\'est pas ta commande.', ephemeral: true });
                return;
            }

            const [, direction] = btn.customId.split(':');
            if (direction === 'next' && page < totalPages) page++;
            if (direction === 'prev' && page > 1)          page--;

            await btn.update(getPage(page));
        });

        collector.on('end', async () => {
            // Désactive les boutons à expiration
            const payload = getPage(page);
            payload.components[0].components.forEach((btn: any) => btn.setDisabled(true));
            await msg.edit(payload).catch(() => {});
        });
    },
};
