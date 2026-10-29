import { User } from "../interface/user.interface";

interface Subscription {
  planName: "free" | "pro" | "enterprise";
}

type UserT = User & { subscription?: Subscription };

export class UserDTO {
  id: string;
  username: string;
  email: string | null;
  avatar: string | null;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  plan: "free" | "pro" | "enterprise";

  constructor(user: UserT) {
    this.id = user.id;
    this.username = user.username;
    this.email = user.email ?? null;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    this.name = user.name ?? null;
    this.avatar = user.avatar ?? null;
    this.plan = user.subscription?.planName || "free";
  }
}
