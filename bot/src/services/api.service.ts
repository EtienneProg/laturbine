const API_URL    = process.env.API_URL    ?? 'http://localhost:3000';
const API_SECRET = process.env.API_SECRET ?? '';

interface ActiveMessage {
    type:      string;
    refId:     number;
    messageId: string;
    channelId: string;
}

async function request<T>(
    method: string,
    path: string,
    body?: object,
): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${API_SECRET}`,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${method} ${path} → ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
}

export const apiService = {
    // Messages actifs
    getActiveMessages: (): Promise<ActiveMessage[]> =>
        request('GET', '/discord/active-messages'),

    saveMessage: (type: string, refId: number, messageId: string, channelId: string) =>
        request('POST', '/discord/messages', { type, refId, messageId, channelId }),

    deleteMessage: (type: string, refId: number) =>
        request('DELETE', `/discord/messages/${type}/${refId}`),

    // Sessions
    getSession: (id: number) =>
        request('GET', `/sessions/${id}`),

    registerPlayer: (sessionId: number, discordId: string, discordTag: string, displayName: string, avatarUrl: string | null) =>
        request('POST', `/sessions/${sessionId}/register-discord/${discordId}`, {
            discordTag, displayName, avatarUrl,
        }),

    unregisterPlayer: (sessionId: number, discordId: string) =>
        request('DELETE', `/sessions/${sessionId}/register-discord/${discordId}`),

    // Leaderboard
    getLeaderboard: () =>
        request('GET', '/leaderboard'),

    // Joueur par discord ID
    getPlayerByDiscordId: (discordId: string) =>
        request('GET', `/players/discord/${discordId}`),

    getDuel: (id: number) =>
        request('GET', `/games/${id}`),
};
