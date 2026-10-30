import ApiResponse from "../utils/apiRespone";
import { User } from "./user.interface";

export interface IAuthService {
  // signInWithGoogle(token: string): Promise<ApiResponse>;  // OAuth disabled
  signup(username: string, password: string): Promise<ApiResponse>;
  login(username: string, password: string): Promise<ApiResponse>;
  refresh_token(user: User): Promise<ApiResponse>;
}
