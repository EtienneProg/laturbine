import {Message, TextChannel} from 'discord.js';

export const messageService = {

    // Garde juste une référence au message — les boutons sont gérés par interactionCreate
    async attachSessionCollector(message: Message, sessionId: number): Promise<void> {
        console.log(`✅ Message session #${sessionId} prêt (${message.id})`);
        // Les interactions sont gérées globalement dans interactionCreate.ts
        // Pas besoin de collector local
    },

    // Vide un channel, quel que soit l'âge des messages.
// bulkDelete refuse les messages de +14 jours et exige 2-100 messages ;
// pour ceux-là on bascule sur une suppression individuelle (plus lente,
// mais discord.js gère le rate-limit automatiquement).
    async clearChannelMessages(channel: TextChannel): Promise<void> {
        const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

        // Boucle jusqu'à ce que le channel soit vide, ou qu'on ne progresse plus
        // (garde-fou si un message ne peut pas être supprimé, ex: permissions)
        while (true) {
            const fetched = await channel.messages.fetch({ limit: 100 });
            if (fetched.size === 0) break;

            const now = Date.now();
            const recent = fetched.filter((m) => now - m.createdTimestamp < TWO_WEEKS_MS);
            const old = fetched.filter((m) => now - m.createdTimestamp >= TWO_WEEKS_MS);

            let deletedThisRound = 0;

            // Récents (< 14 jours) → bulkDelete, rapide
            if (recent.size === 1) {
                await recent.first()!.delete()
                    .then(() => deletedThisRound++)
                    .catch(() => {});
            } else if (recent.size > 1) {
                const result = await channel.bulkDelete(recent, true).catch(() => null);
                if (result) deletedThisRound += result.size;
            }

            // Anciens (≥ 14 jours) → suppression un par un, seule option possible
            for (const message of old.values()) {
                await message.delete()
                    .then(() => deletedThisRound++)
                    .catch(() => {});
            }

            if (deletedThisRound === 0) {
                // Rien n'a pu être supprimé ce tour-ci (ex: permissions manquantes)
                // → on arrête pour éviter une boucle infinie
                console.warn(`⚠️ Impossible de vider complètement #${channel.name} (permissions ?)`);
                break;
            }
        }
    }
};
