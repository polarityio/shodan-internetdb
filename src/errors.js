const { getLogger } = require('./logger');

// The following is a list of NodeJS error codes that are related
// to TLS/SSL certificate errors.  These can be encountered when attempting to connect
// to a server/API/endpoint that has an invalid or untrusted TLS certificate.
//
// These codes were taken from this github issue:
// https://github.com/nodejs/node/issues/29342
const SSL_ERROR_CODES = new Set([
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_CRL',
  'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
  'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
  'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
  'CERT_SIGNATURE_FAILURE',
  'CRL_SIGNATURE_FAILURE',
  'CERT_NOT_YET_VALID',
  'CERT_HAS_EXPIRED',
  'CRL_NOT_YET_VALID',
  'CRL_HAS_EXPIRED',
  'ERROR_IN_CERT_NOT_BEFORE_FIELD',
  'ERROR_IN_CERT_NOT_AFTER_FIELD',
  'ERROR_IN_CRL_LAST_UPDATE_FIELD',
  'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
  'OUT_OF_MEM',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'CERT_CHAIN_TOO_LONG',
  'CERT_REVOKED',
  'INVALID_CA',
  'PATH_LENGTH_EXCEEDED',
  'INVALID_PURPOSE',
  'CERT_UNTRUSTED',
  'CERT_REJECTED'
]);

// The following is a list of NodeJS error codes that are related to network connectivity issues
const NETWORK_CONNECTION_ERROR_CODES = new Set([
  'ECONNRESET',
  'ENOTFOUND',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'EHOSTUNREACH'
]);

/**
 * Given an instance of Error, return a POJO containing the Error's properties but as enumerable properties
 *
 *
 *
 * @param error {Error}
 * @returns {Object}
 */
//TODO: JSON.stringify(error, Object.getOwnPropertyNames(error)) doesn't seem to stringify nested properties
//so anything inside the `meta` property doesn't get stringified
const parseErrorToReadableJSON = (error) => {
  if(error instanceof IntegrationError){
    return JSON.parse(JSON.stringify(error))
  } else {
    return JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
  }
}


/**
 * Native errors contain the following properties:
 * cause
 * code
 * message
 * stack
 * https://nodejs.org/dist/latest-v18.x/docs/api/errors.html#class-error
 */
class IntegrationError extends Error {
  /**
   * Construct a new IntegrationError object.
   * @param message {string} - A string description of the error which is used as the `detail` property on the
   * serialized error.
   * @param properties {Object} - Optional properties for the error.  There are two special properties which have special
   * handling:
   *
   * {Error | string | Object} cause - The `cause` property is used to specify the `cause` of the error.  Typically,
   * this property is used to pass through a related Error instance.
   * https://nodejs.org/dist/latest-v18.x/docs/api/errors.html#errorcause
   *
   * {Object} requestOptions - Relevant for integration errors involving a network call, the `requestOptions` property
   * details the request options that resulted in the specified error.  The `requestOptions` property will automatically
   * have sensitive authentication headers stripped.
   */
  constructor(message, properties = {}) {
    const Logger = getLogger();
    super(message);
    // These are enumerable properties which the Polarity server can access
    // Most important is the `detail` property which is used to display
    // a user friendly message in the Overlay Window.
    this.detail = message;
    this.name = this.constructor.name;
    this.help = '';
    this.meta = {
      ...properties
    };
    if (properties.cause instanceof Error) {
      this.meta.cause = parseErrorToReadableJSON(properties.cause);
    }
    if (properties.requestOptions) {
      this.meta.requestOptions = this.sanitizeRequestOptions(properties.requestOptions);
    }
  }

  /**
   * Given a postman-request options object, will return a sanitized object with basic auth and Authorization headers
   * removed.
   *
   * TODO: Come up with a more robust way to detect secrets and obscure them
   *
   * @param requestOptions
   * @returns {*}
   */
  sanitizeRequestOptions(requestOptions) {
    const sanitizedOptions = {
      ...requestOptions
    };

    if (sanitizedOptions.headers && sanitizedOptions.headers.Authorization) {
      sanitizedOptions.headers.Authorization = '**********';
    }

    if (sanitizedOptions.auth && sanitizedOptions.auth.password) {
      sanitizedOptions.auth.password = '**********';
    }

    if (sanitizedOptions.auth && sanitizedOptions.auth.bearer) {
      sanitizedOptions.auth.bearer = '**********';
    }

    if (requestOptions.body && requestOptions.body.password) {
      requestOptions.body.password = '**********';
    }

    if (requestOptions.form && requestOptions.form.client_secret) {
      requestOptions.form.client_secret = '**********';
    }

    return sanitizedOptions;
  }

  /**
   * Serializes the error's properties into a POJO.  The order of the
   * properties is preserved when serialized.
   *
   * @returns {{name: string, detail: string}}
   */
  toJSON() {
    const Logger = getLogger();

    let props = {
      name: this.name,
      detail: this.detail
    };

    if (this.help) {
      props.help = this.help;
    }

    if (this.stack) {
      props.stack = this.stack;
    }

    if (Object.keys(this.meta).length > 0) {
      props.meta = this.meta;
    }

    return props;
  }
}

/**
 * Generic network error for REST requests.
 * https://betterstack.com/community/guides/scaling-nodejs/nodejs-errors/#4-econnrefused
 */
class NetworkError extends IntegrationError {
  constructor(message, properties = {}) {
    super(message, properties);

    // Check if we are wrapping an original error
    if (properties.cause instanceof Error) {
      const originalError = properties.cause;

      if (SSL_ERROR_CODES.has(originalError.code)) {
        this.help =
          'SSL errors are typically caused by an untrusted SSL certificate in the HTTPS request chain (e.g., ' +
          'an internal server that is being queried directly, or a web proxy for external requests). You can temporarily ' +
          'ignore SSL validation errors by enabling the integration setting "Allow Insecure TLS/SSL Connections". In most ' +
          "cases, you will need to add your organization's Certificate Authority to the Polarity Server to resolve the " +
          'issue permanently.';
      } else if (NETWORK_CONNECTION_ERROR_CODES.has(originalError.code)) {
        this.help =
          'Network connection issues are typically caused by a misconfigured proxy or firewall rule. You may ' +
          'need to add a proxy configuration to the integration and/or confirm that connectivity between the Polarity ' +
          'Server and the intended host is available.';
      }
    }
  }
}

/**
 * API error for REST requests
 */
class ApiRequestError extends IntegrationError {
  constructor(message, properties = {}) {
    super(message, properties);
  }
}

/**
 * Thrown by generateAccessToken method if there is a failure to fetch a token
 */
class AuthRequestError extends IntegrationError {
  constructor(message, properties = {}) {
    super(message, properties);
  }
}

/**
 * Thrown by authenticated request method for any HTTP status codes where we want to allow
 * the user to retry their lookup.
 */
class RetryRequestError extends IntegrationError {
  constructor(message, properties = {}) {
    super(message, properties);
  }
}

module.exports = {
  ApiRequestError,
  NetworkError,
  AuthRequestError,
  RetryRequestError,
  parseErrorToReadableJSON
};
