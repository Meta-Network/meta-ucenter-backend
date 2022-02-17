export type SocialAuthBoundMessage = {
  userId: number;
  platform: string;
  token?: string;
};

export type UserInvitationCountPayload = {
  userId: number;
  count: number;
};
