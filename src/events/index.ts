enum Events {
  UserCreated = 'user.created',
  UserProfileModified = 'user.profile.modified',
  UserBoundSocialAuth = 'user.socialauth.bound',
  UserUnboundSocialAuth = 'user.socialauth.unbound',
  UserInvitationCountUpdated = 'user.invitation.count.updated',
}

export default Events;
