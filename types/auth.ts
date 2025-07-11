export interface Challenge {
  message: string;
  challengeId: string;
}

export interface ChallengeExchange {
  token: string;
  expiresAt: string;
}
