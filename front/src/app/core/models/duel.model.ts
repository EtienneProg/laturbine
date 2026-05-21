import { Team } from './team.model';
import { EloPoint } from './player.model';

export type DuelStatus = 'ONGOING' | 'FINISHED';

export interface Duel {
  id: number;
  sessionId: number;
  teamSize: number;
  teams: [Team, Team];
  status: DuelStatus;
  winnerTeamId: number | null;
  createdAt: Date;
  finishedAt: Date | null;
  eloHistory: EloPoint[];
}

export interface CreateDuelPayload {
  sessionId: number;
  teamSize: number;
  team1PlayerIds: number[];
  team2PlayerIds: number[];
}

export interface DuelResultPayload {
  winnerTeamId: number;
}
