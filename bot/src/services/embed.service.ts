import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const embedService = {

    // Embed annonce session avec boutons inscription
    sessionAnnounce(session: any, registeredCount: number) {
        const embed = new EmbedBuilder()
            .setTitle('📅 Nouvelle session de duels !')
            .setDescription(`Les duels du **${session.date}** sont ouverts !\nClique sur un bouton pour t'inscrire ou te désinscrire.`)
            .addFields({ name: '👥 Inscrits', value: `${registeredCount}`, inline: true })
            .setColor(0x00f5ff)
            .setFooter({ text: 'La Turbine — Laser Game' })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`register:${session.id}`)
                .setLabel('✅ Je m\'inscris')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`unregister:${session.id}`)
                .setLabel('❌ Je me désinscris')
                .setStyle(ButtonStyle.Danger),
        );

        return { embeds: [embed], components: [row] };
    },

    // Mise à jour du compteur d'inscrits
    sessionUpdate(session: any, registeredCount: number) {
        const embed = new EmbedBuilder()
            .setTitle('📅 Session de duels')
            .setDescription(`Les duels du **${session.date}** — inscriptions ouvertes !`)
            .addFields({ name: '👥 Inscrits', value: `${registeredCount}`, inline: true })
            .setColor(0x00f5ff)
            .setFooter({ text: 'La Turbine — Laser Game' })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`register:${session.id}`)
                .setLabel('✅ Je m\'inscris')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`unregister:${session.id}`)
                .setLabel('❌ Je me désinscris')
                .setStyle(ButtonStyle.Danger),
        );

        return { embeds: [embed], components: [row] };
    },

    // Embed annonce duel
    duelAnnounce(duel: any) {
        const team1 = duel.teams.find((t: any) => t.number === 1);
        const team2 = duel.teams.find((t: any) => t.number === 2);

        const team1Names = team1?.players.map((tp: any) => tp.player.name).join('\n') ?? '—';
        const team2Names = team2?.players.map((tp: any) => tp.player.name).join('\n') ?? '—';

        const embed = new EmbedBuilder()
            .setTitle('⚔️ Duel lancé !')
            .addFields(
                { name: '🔵 Équipe 1', value: team1Names, inline: true },
                { name: '🟣 Équipe 2', value: team2Names, inline: true },
            )
            .setColor(0xff6b35)
            .setFooter({ text: 'La Turbine — Laser Game' })
            .setTimestamp();

        return { embeds: [embed] };
    },

    // Embed résultat duel
    duelResult(duel: any) {
        const winnerTeam = duel.teams.find((t: any) => t.id === duel.winnerTeamId);
        const loserTeam  = duel.teams.find((t: any) => t.id !== duel.winnerTeamId);

        const winnerNames = winnerTeam?.players.map((tp: any) => tp.player.name).join(', ') ?? '—';
        const loserNames  = loserTeam?.players.map((tp: any) => tp.player.name).join(', ') ?? '—';

        const eloLines = duel.eloHistory.map((h: any) => {
            const sign = h.delta >= 0 ? '+' : '';
            return `**${h.player.name}** : ${h.eloBefore} → ${h.eloAfter} (${sign}${h.delta})`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('🏆 Résultat du duel !')
            .addFields(
                { name: '🥇 Vainqueurs', value: winnerNames, inline: true },
                { name: '💀 Perdants',   value: loserNames,  inline: true },
                { name: '\u200B',        value: '\u200B',     inline: true },
                { name: '📊 Évolution ELO', value: eloLines || '—' },
            )
            .setColor(0x00ff88)
            .setFooter({ text: 'La Turbine — Laser Game' })
            .setTimestamp();

        return { embeds: [embed] };
    },

    // Embed leaderboard paginé
    leaderboard(players: any[], page: number, totalPages: number) {
        const lines = players.map((p, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const rank   = medals[i] ?? `#${p.rank}`;
            return `${rank} **${p.name}** — ${p.elo} ELO (${p.wins}V/${p.losses}D)`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('🏆 Leaderboard — La Turbine')
            .setDescription(lines || 'Aucun joueur')
            .setColor(0x00f5ff)
            .setFooter({ text: `Page ${page}/${totalPages} • La Turbine` })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(`leaderboard:prev:${page}`)
                .setLabel('◀ Précédent')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page <= 1),
            new ButtonBuilder()
                .setCustomId(`leaderboard:next:${page}`)
                .setLabel('Suivant ▶')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page >= totalPages),
        );

        return { embeds: [embed], components: [row] };
    },
};
