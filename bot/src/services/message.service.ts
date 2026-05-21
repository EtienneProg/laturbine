import { Message } from 'discord.js';

export const messageService = {

    // Garde juste une référence au message — les boutons sont gérés par interactionCreate
    async attachSessionCollector(message: Message, sessionId: number): Promise<void> {
        console.log(`✅ Message session #${sessionId} prêt (${message.id})`);
        // Les interactions sont gérées globalement dans interactionCreate.ts
        // Pas besoin de collector local
    },
};
