/**
 * Generic error for REST requests
 */
class RequestError extends Error {
  constructor (message, status, description, requestOptions) {
    super(message);
    this.name = 'requestError';
    this.status = status;
    this.description = description;
    this.requestOptions = requestOptions;
    this.source = '';
    this.meta = null;
  }
}

/**
 * Thrown by generateAccessToken method if there is a failure to fetch a token
 */
class TokenRequestError extends Error {
  constructor (message, status, description, requestOptions) {
    super(message);
    this.name = 'tokenRequestError';
    this.status = status;
    this.description = description;
    this.requestOptions = requestOptions;
    this.source = '';
    this.meta = null;
  }
}

/**
 * Thrown by authenticated request method for any HTTP status codes where we want to allow
 * the user to retry their lookup.
 */
class RetryRequestError extends Error {
  constructor (message, status, description, requestOptions) {
    super(message);
    this.name = 'retryRequestError';
    this.status = status;
    this.description = description;
    this.requestOptions = requestOptions;
    this.source = '';
    this.meta = null;
  }
}

/**
 * Thrown by a request method if the request fails validation.  This is typically a 422 error.
 * 
 */
class ValidationError extends Error {
  constructor (message, status, description, requestOptions) {
    super(message);
    this.name = 'validationRequestError';
    this.status = status;
    this.description = description;
    this.requestOptions = requestOptions;
    this.source = '';
    this.meta = null;
  }
}

module.exports = { RequestError, TokenRequestError, RetryRequestError, ValidationError };
