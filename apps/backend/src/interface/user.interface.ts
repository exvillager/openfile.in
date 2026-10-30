import { users } from "../db/schema";

export type User = typeof users.$inferSelect;

export type UserWithPlan = NonNullable<Awaited<ReturnType<IUserRepository["findUserAndPlanName"]>>>;

export interface IUserRepository {
  findUserId(id: string): Promise<{ id: string } | null>;

  // findUserByEmail(email: string): Promise<User | null>;  // email auth disabled

  createUser(username: string, password: string): Promise<User | null>;

  findUserAndPlanName(userId: string): Promise<{
    id: string;
    name: string | null;
    email: string | null;
    username: string;
    avatar: string | null;
    linkCount: number;
    linkCountExpireAt: Date | null;
    subscription: {
      planName: string;
    } | null;
  } | null>;

  findUserByUsername(username: string): Promise<User | null>;
}
