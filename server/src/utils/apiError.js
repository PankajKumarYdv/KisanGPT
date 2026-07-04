export class ApiError extends Error {
  constructor(statusCode, message = 'Internal Server Error', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.message = message;
    this.errors = errors;
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: false,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
    });
  }
}
