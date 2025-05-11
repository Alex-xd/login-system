/**
 * @fileoverview Define the standard API response format.
 */

/**
 * API response interface.
 */
export interface ApiResponse<T = any> {
  code: number; // status code
  message: string; // response message
  data?: T; // optional data
}

/**
 * API response utility class.
 */
export class ApiResponseUtil {
  static success<T>(data: T, message = "Success"): ApiResponse<T> {
    return { code: 200, message, data };
  }

  static error(message = "Error", code = 500): ApiResponse<null> {
    return { code, message, data: null };
  }

  static custom<T>(code: number, message: string, data?: T): ApiResponse<T> {
    return { code, message, data };
  }
}
