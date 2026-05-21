import { Player } from './player.model';

export interface TeamPlayer {
  id: number;
  teamId: number;
  playerId: number;
  player: Player;
}

export interface Team {
  id: number;
  number: number;
  duelId: number;
  players: TeamPlayer[];
}
