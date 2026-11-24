export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = 'ERROR',
    public readonly details?: unknown,
  ) {
    super(message);
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }
  static forbidden(message = 'You do not have permission to perform this action') {
    return new ApiError(403, message, 'FORBIDDEN');
  }
  static notFound(resource = 'Resource') {
    return new ApiError(404, `${resource} not found`, 'NOT_FOUND');
  }
  static conflict(message: string) {
    return new ApiError(409, message, 'CONFLICT');
  }
  static unavailable(message: string) {
    return new ApiError(503, message, 'SERVICE_UNAVAILABLE');
  }
}
