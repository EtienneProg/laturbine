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
        const team1 = duel.teams.find((t: any) => t.name === 'Équipe 1');
        const team2 = duel.teams.find((t: any) => t.name === 'Équipe 2');

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

    vampireResult(game: any) {
        const vampireTeam  = game.teams.find((t: any) => t.name === 'Vampires');
        const villagerTeam = game.teams.find((t: any) => t.name === 'Villageois');
        const winnerTeam   = game.teams.find((t: any) => t.id === game.winnerTeamId);

        const vampireNames  = vampireTeam?.players.map((tp: any) => tp.player.name).join(', ') ?? '—';
        const villagerNames = villagerTeam?.players.map((tp: any) => tp.player.name).join(', ') ?? '—';
        const winnerLabel   = winnerTeam?.name === 'Vampires' ? '🧛 Les Vampires ont gagné !' : '🏘️ Les Villageois ont survécu !';

        const embed = new EmbedBuilder()
            .setTitle('🧛 Résultat — Mode Vampire')
            .setDescription(winnerLabel)
            .addFields(
                { name: '🧛 Vampires',   value: vampireNames,  inline: true },
                { name: '🏘️ Villageois', value: villagerNames, inline: true },
            )
            .setColor(winnerTeam?.name === 'Vampires' ? 0xbf5fff : 0x00f5ff)
            .setFooter({ text: 'La Turbine — Laser Game' })
            .setTimestamp();

        return { embeds: [embed] };
    },

    hungerGamesResult(game: any) {
        const winnerTeam = game.teams.find((t: any) => t.id === game.winnerTeamId);
        const winners = winnerTeam?.players.map((tp: any) => tp.player.name).join(', ') ?? '—';

        const embed = new EmbedBuilder()
            .setTitle('🏹 Résultat — Hunger Games')
            .setDescription('Le(s) dernier(s) survivant(s) !')
            .addFields(
                { name: '🏆 Gagnant(s)', value: winners || '—' },
            )
            .setColor(0xff6b35)
            .setFooter({ text: 'La Turbine — Laser Game' })
            .setTimestamp();

        return { embeds: [embed] };
    },

    // Embed annonce achievement débloqué
    // achievement : { key, name, icon, category }
    achievementUnlocked(playerName: string, achievement: any) {
        const icon = achievement.icon || '🏆';

        const categoryLabels: Record<string, string> = {
            DUEL: 'Duel',
            GRADE: 'Grade ELO',
            VAMPIRE: 'Vampire',
            SURVIVOR: 'Survivor',
            HG: 'Hunger Games',
        };
        const categoryLabel = categoryLabels[achievement.category] ?? achievement.category;

        const embed = new EmbedBuilder()
            .setTitle(`${icon} Succès débloqué !`)
            .setDescription(`**${playerName}** vient de débloquer **${achievement.name}** !`)
            .setColor(0xffd700)
            .setFooter({ text: categoryLabel ? `${categoryLabel} • La Turbine` : 'La Turbine — Laser Game' })
            .setTimestamp();

        return { embeds: [embed] };
    },

    // Embed profil joueur (ex-messtats) — stats saison en cours + achievements + lien profil
    playerProfile(player: any) {
        const total   = player.wins + player.losses;
        const winRate = total === 0 ? '—' : `${Math.round((player.wins / total) * 100)}%`;

        const rankLabel =
            player.elo >= 2000 ? '👑 Légende' :
                player.elo >= 1800 ? '💎 Elite'   :
                    player.elo >= 1650 ? '🔥 Pro'     :
                        player.elo >= 1500 ? '⚡ Confirmé' :
                            player.elo >= 1350 ? '🎯 Intermédiaire' :
                                '🌱 Débutant';

        const achievements = player.achievements ?? [];
        const achievementsList = achievements.length > 0
            ? achievements.map((a: any) => `${a.icon} **${a.name}**`).join('\n')
            : '_Aucun succès débloqué pour l\'instant_';

        const embed = new EmbedBuilder()
            .setTitle(`📊 Profil de ${player.name}`)
            .addFields(
                { name: '🏅 Rang',      value: `#${player.rank}`,   inline: true },
                { name: '⚡ ELO',       value: `${player.elo}`,     inline: true },
                { name: '🎖️ Niveau',    value: rankLabel,            inline: true },
                { name: '🏆 Victoires', value: `${player.wins}`,    inline: true },
                { name: '💀 Défaites',  value: `${player.losses}`,  inline: true },
                { name: '📈 Win Rate',  value: winRate,              inline: true },
                { name: `🎯 Succès débloqués (${achievements.length})`, value: achievementsList },
            )
            .setColor(0x00f5ff)
            .setFooter({ text: 'Saison en cours — La Turbine' })
            .setTimestamp();

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('Voir le profil complet')
                .setStyle(ButtonStyle.Link)
                .setURL(`${process.env.PUBLIC_SITE_URL}/public/players/${player.id}`),
        );

        return { embeds: [embed], components: [row] };
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
