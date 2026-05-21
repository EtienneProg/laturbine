import { Player, EloPoint } from './player.model';

export interface GameMode {
  id:          number;
  key:         string;
  name:        string;
  description: string;
  icon:        string;
  teamNames:   string[];
  hasElo:      boolean;
  hasTeams:    boolean;
}

export type GameStatus = 'ONGOING' | 'FINISHED';

export interface TeamPlayer {
  id:       number;
  teamId:   number;
  playerId: number;
  player:   Player;
}

export interface Team {
  id:      number;
  name:    string;
  gameId:  number;
  players: TeamPlayer[];
}

export interface Game {
  id:           number;
  sessionId:    number;
  gameModeId:   number;
  gameMode:     GameMode;
  status:       GameStatus;
  winnerTeamId: number | null;
  createdAt:    Date;
  finishedAt:   Date | null;
  teams:        Team[];
  eloHistory:   EloPoint[];
}

export interface CreateTeamPayload {
  playerIds: number[];
}

export interface CreateGamePayload {
  sessionId:  number;
  gameModeId: number;
  teams?:     CreateTeamPayload[];
}

export interface SetResultDuelPayload {
  winnerTeamId: number;
}

export interface SetResultVampirePayload {
  winner:                'vampires' | 'villagers';
  survivingVillagerIds:  number[];
}

export interface SetResultHungerGamesPayload {
  winnerPlayerIds: number[];
  lastManStanding: boolean;
}
