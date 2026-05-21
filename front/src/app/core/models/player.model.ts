export interface Player {
  id: number;
  name: string;
  discordId: string;
  discordTag: string;
  elo: number;
  wins: number;
  losses: number;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerStats extends Player {
  rank: number;
  winRate: number;
  eloHistory: EloPoint[];
}

export interface EloPoint {
  id:        number;
  playerId:  number;
  gameId:    number;
  eloBefore: number;
  eloAfter:  number;
  delta:     number;
  createdAt: Date;
  player: {
    id:   number;
    name: string;
  };
}
