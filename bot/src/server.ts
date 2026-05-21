import express from 'express';
import { BotClient } from './index';
import { TextChannel } from 'discord.js';
import { embedService } from './services/embed.service';
import { apiService } from './services/api.service';
import { messageService } from './services/message.service';

export function startServer(client: BotClient): void {
    const app  = express();
    const port = process.env.BOT_PORT ?? 3001;

    app.use(express.json());

    // Vérification token simple
    app.use((req, res, next) => {
        const auth = req.headers.authorization;
        if (auth !== `Bearer ${process.env.API_TOKEN}`) {
            res.status(401).json({ message: 'Non autorisé' });
            return;
        }
        next();
    });

    // Annonce session avec boutons
    app.post('/announce-session/:id', async (req, res) => {
        try {
            const sessionId = Number(req.params.id);
            const session   = await apiService.getSession(sessionId) as any;
            const count     = session.registrations?.length ?? 0;

            const channel = await client.channels.fetch(
                process.env.CHANNEL_SESSIONS!
            ) as TextChannel;

            const message = await channel.send(
                embedService.sessionAnnounce(session, count)
            );

            // Sauvegarde l'ID du message
            await apiService.saveMessage(
                'session', sessionId,
                message.id, channel.id
            );

            // Attache le collector de boutons
            await messageService.attachSessionCollector(message, sessionId);

            res.json({ success: true, messageId: message.id });
        } catch (err: any) {
            console.error('Erreur announce-session:', err);
            res.status(500).json({ message: err.message });
        }
    });

    // Annonce duel
    app.post('/announce-duel/:id', async (req, res) => {
        try {
            const duelId  = Number(req.params.id);
            const duel    = await apiService.getDuel(duelId) as any;

            const channel = await client.channels.fetch(
                process.env.CHANNEL_DUELS!
            ) as TextChannel;

            const message = await channel.send(embedService.duelAnnounce(duel));

            await apiService.saveMessage('duel', duelId, message.id, channel.id);

            res.json({ success: true, messageId: message.id });
        } catch (err: any) {
            console.error('Erreur announce-duel:', err);
            res.status(500).json({ message: err.message });
        }
    });

    // Annonce résultat
    app.post('/announce-result/:id', async (req, res) => {
        try {
            const duelId = Number(req.params.id);
            const duel   = await apiService.getDuel(duelId) as any;

            // Récupère le message existant du duel
            const messages = await apiService.getActiveMessages() as any[];
            const msg = messages.find(m => m.type === 'duel' && m.refId === duelId);

            if (msg) {
                try {
                    // Édite le message existant avec le résultat
                    const channel = await client.channels.fetch(msg.channelId) as TextChannel;
                    const message = await channel.messages.fetch(msg.messageId);
                    await message.edit(embedService.duelResult(duel));
                } catch {
                    // Si message introuvable, envoie dans le channel résultats
                    const channel = await client.channels.fetch(process.env.CHANNEL_RESULTS!) as TextChannel;
                    await channel.send(embedService.duelResult(duel));
                }

                // Supprime de la BDD car le duel est terminé
                await apiService.deleteMessage('duel', duelId);
            } else {
                // Pas de message existant → envoie dans le channel résultats
                const channel = await client.channels.fetch(process.env.CHANNEL_RESULTS!) as TextChannel;
                await channel.send(embedService.duelResult(duel));
            }

            res.json({ success: true });
        } catch (err: any) {
            console.error('Erreur announce-result:', err);
            res.status(500).json({ message: err.message });
        }
    });

    // Supprime un message Discord
    app.delete('/delete-message/:type/:id', async (req, res) => {
        try {
            const { type, id } = req.params;

            // Récupère l'info du message depuis l'API
            const messages = await apiService.getActiveMessages() as any[];
            const msg = messages.find(m => m.type === type && m.refId === Number(id));

            if (msg) {
                try {
                    const channel = await client.channels.fetch(msg.channelId) as TextChannel;
                    const message = await channel.messages.fetch(msg.messageId);
                    await message.delete();
                } catch {
                    console.warn(`Message Discord ${msg.messageId} déjà supprimé ou introuvable`);
                }

                // Supprime de la BDD
                await apiService.deleteMessage(type, Number(id));
            }

            res.json({ success: true });
        } catch (err: any) {
            console.error('Erreur delete-message:', err);
            res.status(500).json({ message: err.message });
        }
    });

    app.listen(port, () => {
        console.log(`🌐 Bot HTTP server listening on port ${port}`);
    });
}
