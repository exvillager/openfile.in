export default class ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;

  constructor(statusCode: number, message: string = "Success", data: T) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
