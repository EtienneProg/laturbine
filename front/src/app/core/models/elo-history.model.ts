export interface EloHistory {
  id: number;
  playerId: number;
  duelId: number;
  eloBefore: number;
  eloAfter: number;
  delta: number;
  createdAt: Date;
  player: {
    id: number;
    name: string;
  };
}
