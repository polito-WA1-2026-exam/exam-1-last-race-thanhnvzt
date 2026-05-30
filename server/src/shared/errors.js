export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.publicMessage = message;
  }
}

export class NotImplementedError extends HttpError {
  constructor(featureName) {
    super(501, `${featureName} is not implemented yet`);
  }
}
