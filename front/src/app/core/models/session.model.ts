export type SessionStatus = 'OPEN' | 'ACTIVE' | 'CLOSED';

export interface Session {
  id: number;
  date: string;
  status: SessionStatus;
  registrations: Registration[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Registration {
  id: number;
  playerId: number;
  sessionId: number;
  registeredAt: Date;
  player: {
    id: number;
    name: string;
  };
}
