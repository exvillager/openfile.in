export const getFinalLinkExpiration = (
  expiresAt: Date | string,
  maxExpiration: any,
  now: Date,
): Date | string => {
  if (expiresAt) {
    const userExp = new Date(expiresAt);
    // if (userExp.getTime() - now.getTime() > maxExpiration) {
    //     finalExpiration = new Date(now.getTime() + maxExpiration)
    // }
    // else {
    //     finalExpiration = userExp
    // }
    return userExp.getTime() - now.getTime() > maxExpiration
      ? new Date(now.getTime() + maxExpiration)
      : userExp;
  } else {
    return new Date(now.getTime() + maxExpiration);
  }
};
