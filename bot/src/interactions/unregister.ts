import { ButtonInteraction, MessageFlags } from 'discord.js';
import { apiService } from '../services/api.service';
import { embedService } from '../services/embed.service';

export async function handleUnregister(
    interaction: ButtonInteraction,
    params: string[],
): Promise<void> {
    const sessionId = Number(params[0]);
    const discordId = interaction.user.id;

    await interaction.reply({
        content: '⏳ Désinscription en cours...',
        flags: MessageFlags.Ephemeral,
    });

    try {
        await apiService.unregisterPlayer(sessionId, discordId);

        const session = await apiService.getSession(sessionId) as any;
        const count   = session.registrations?.length ?? 0;

        await interaction.message.edit(embedService.sessionUpdate(session, count));

        await interaction.editReply({
            content: `❌ Tu t'es désinscrit de la session du **${session.date}**.`,
        });

    } catch (err: any) {
        const msg = err.message?.includes('404')
            ? '❌ Tu n\'étais pas inscrit à cette session.'
            : '⚠️ Une erreur est survenue.';

        await interaction.editReply({ content: msg });
    }
}
