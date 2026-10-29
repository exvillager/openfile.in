// import { oAuthClient } from "../config/oauth";  // OAuth disabled
import { generateAccessAndRefreshToken } from "../utils/generate.token";
import { UserDTO } from "../dto/user.dto";
import { ApiError } from "../utils/apiError";
import ApiResponse from "../utils/apiRespone";
import { IUserRepository, User } from "../interface/user.interface";
import { INotification } from "../interface/notification.interface";
import { IAuthService } from "../interface/auth.interface";

export class AuthService implements IAuthService {
  private static instance: AuthService;

  constructor(
    _notificationService: INotification,
    private userRepository: IUserRepository,
  ) {}

  static getInstance(notificationService: INotification, userRepository: IUserRepository) {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(notificationService, userRepository);
    }
    return AuthService.instance;
  }

  // signInWithGoogle = async (token: string): Promise<ApiResponse> => {
  //   const ticket = await oAuthClient.verifyIdToken({
  //     idToken: token,
  //     audience: process.env.GOOGLE_CLIENT_ID,
  //   });
  //   if (!ticket) throw new ApiError("Invalid id_token", 401);
  //   const payload = ticket.getPayload();
  //   if (!payload || !payload?.email) throw new ApiError("Invalid id_token", 401);
  //   const { email, name, picture } = payload;
  //   let user = await this.userRepository.findUserByEmail(email)
  //   if (!user) {
  //     user = await this.userRepository.createUser(name, email, picture) as any
  //     if (!user) throw new ApiError("Something went wrong while creating user", 500)
  //     this.notificationService.sendWelcomeEmail(email);
  //   }
  //   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
  //   const userDTO = new UserDTO(user);
  //   return new ApiResponse(201, "Login successful", { user: userDTO, accessToken, refreshToken })
  // }

  signup = async (username: string, password: string): Promise<ApiResponse> => {
    const existingUser = await this.userRepository.findUserByUsername(username);
    if (existingUser) throw new ApiError("Username already taken", 409);

    const user = await this.userRepository.createUser(username, password);
    if (!user) throw new ApiError("Something went wrong while creating user", 500);

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    const userDTO = new UserDTO(user);

    return new ApiResponse(201, "Account created successfully", {
      user: userDTO,
      accessToken,
      refreshToken,
    });
  };

  login = async (username: string, password: string): Promise<ApiResponse> => {
    const user = await this.userRepository.findUserByUsername(username);
    if (!user) throw new ApiError("Invalid credentials", 401);
    if (!user.passoword) throw new ApiError("Invalid credentials", 401);

    const isPasswordValid = await Bun.password.verify(password, user.passoword);
    if (!isPasswordValid) throw new ApiError("Invalid credentials", 401);

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    const userDTO = new UserDTO(user);

    return new ApiResponse(200, "Login successful", { user: userDTO, accessToken, refreshToken });
  };

  refresh_token = async (user: User) => {
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    return new ApiResponse(200, "new access_token generated successfully", {
      accessToken,
      refreshToken,
    });
  };
}
