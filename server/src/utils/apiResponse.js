export class ApiResponse {
  constructor(statusCode, message, data = null, meta = undefined) {
    this.statusCode = statusCode;
    this.success = true;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  send(res) {
    const payload = {
      success: true,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data || {},
      meta: this.meta || {},
    };
    return res.status(this.statusCode).json(payload);
  }
}
