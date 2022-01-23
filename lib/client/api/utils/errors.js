export class ErrorFetchTimeout extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ErrorFetchNoResponse extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = this.constructor.name;
    this.originalError = originalError;
  }
}

export class ErrorFetchWithResponse extends Error {
  constructor(message, code) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class ErrorFetchWithJson extends Error {
  constructor(message, code, json) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.json = json;
  }
}
