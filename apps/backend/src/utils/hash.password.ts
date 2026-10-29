export const getHashedPassword = async (rawPassowrd: string) => {
  return await Bun.password.hash(rawPassowrd, { algorithm: "bcrypt", cost: 10 });
};
