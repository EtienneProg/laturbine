import { BotClient } from '../index';
import { apiService } from '../services/api.service';
import { messageService } from '../services/message.service';
import { TextChannel } from 'discord.js';

interface ActiveMessage {
    type:      string;
    refId:     number;
    messageId: string;
    channelId: string;
}

export function readyEvent(client: BotClient): void {
    client.once('clientReady', async () => {
        console.log(`✅ Bot connecté en tant que ${client.user?.tag}`);
        await restoreActiveMessages(client);
    });
}

async function restoreActiveMessages(client: BotClient): Promise<void> {
    console.log('🔄 Restauration des messages actifs...');

    let activeMessages: ActiveMessage[] = [];

    try {
        activeMessages = await apiService.getActiveMessages();
    } catch {
        console.warn('⚠️ API non disponible, restauration ignorée');
        return;
    }

    let restored = 0;
    let cleaned  = 0;

    for (const msg of activeMessages) {
        try {
            // Vérifie si la session/duel existe encore
            let stillExists = false;
            try {
                if (msg.type === 'session') {
                    await apiService.getSession(msg.refId);
                    stillExists = true;
                } else if (msg.type === 'duel') {
                    await apiService.getDuel(msg.refId);
                    stillExists = true;
                }
            } catch {
                stillExists = false;
            }

            // Si n'existe plus → supprime le message Discord + BDD
            if (!stillExists) {
                try {
                    const channel = await client.channels.fetch(msg.channelId) as TextChannel;
                    const message = await channel.messages.fetch(msg.messageId);
                    await message.delete();
                    console.log(`🗑️ Message ${msg.type} #${msg.refId} supprimé (plus d'existence)`);
                } catch {
                    console.warn(`Message ${msg.messageId} déjà supprimé sur Discord`);
                }
                await apiService.deleteMessage(msg.type, msg.refId);
                cleaned++;
                continue;
            }

            // Existe encore → rattache le collector
            const channel = await client.channels.fetch(msg.channelId) as TextChannel;
            if (!channel) continue;

            const message = await channel.messages.fetch(msg.messageId);
            if (!message) continue;

            if (msg.type === 'session') {
                await messageService.attachSessionCollector(message, msg.refId);
                console.log(`✅ Session #${msg.refId} restaurée`);
                restored++;
            }

        } catch (err) {
            console.warn(`⚠️ Impossible de traiter le message ${msg.messageId}:`, err);
        }
    }

    console.log(`✅ ${restored} message(s) restauré(s), ${cleaned} nettoyé(s)`);
}
