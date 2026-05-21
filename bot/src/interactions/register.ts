import { ButtonInteraction, MessageFlags } from 'discord.js';
import { apiService } from '../services/api.service';
import { embedService } from '../services/embed.service';

export async function handleRegister(
    interaction: ButtonInteraction,
    params: string[],
): Promise<void> {
    const sessionId = Number(params[0]);
    const discordId = interaction.user.id;

    // Répond immédiatement pour éviter le timeout de 3s
    await interaction.reply({
        content: '⏳ Inscription en cours...',
        flags: MessageFlags.Ephemeral,
    });

    const avatarUrl = interaction.user.avatarURL({ size: 128 }) ?? null;

    try {
        await apiService.registerPlayer(
            sessionId,
            discordId,
            interaction.user.tag,
            interaction.user.displayName,
            avatarUrl,
        );
        const session = await apiService.getSession(sessionId) as any;
        const count   = session.registrations?.length ?? 0;
        await interaction.message.edit(embedService.sessionUpdate(session, count));

        await interaction.editReply({
            content: `✅ Tu es inscrit pour la session du **${session.date}** !`,
        });

    } catch (err: any) {
        const msg = err.message?.includes('404')
            ? '❌ Ton compte Discord n\'est pas lié à un joueur. Contacte un admin !'
            : '⚠️ Tu es déjà inscrit ou une erreur est survenue.';

        await interaction.editReply({ content: msg });
    }
}
