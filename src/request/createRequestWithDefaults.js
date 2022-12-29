const fs = require('fs');
const request = require('postman-request');
const { get } = require('lodash/fp');
const { ERROR_MESSAGES } = require('../../src/constants');
const { parallelLimit } = require('async/parallelLimit');

const _configFieldIsValid = (field) => typeof field === 'string' && field.length > 0;
const {
  request: { ca, cert, key, passphrase, rejectUnauthorized, proxy }
} = require('../../config/config.js');

const defaults = {
  ...(_configFieldIsValid(ca) && { ca: fs.readFileSync(ca) }),
  ...(_configFieldIsValid(cert) && { cert: fs.readFileSync(cert) }),
  ...(_configFieldIsValid(key) && { key: fs.readFileSync }),
  ...(_configFieldIsValid(passphrase) && { passphrase }),
  ...(_configFieldIsValid(proxy) && { proxy }),
  ...(typeof rejectUnauthorized === 'boolean' && { rejectUnauthorized })
};

class PolarityRequest {
  constructor (options) {
    this.defaults = defaults;
    this.runRequestsInParallel = false; //this is set to true when we want to run multiple requests in parallel;
    (this.options = options), (this.requiresAuthentication = false);
  }
  get = async (opts) => {
    const { Logger } = require('../../integration');
    const { entity, ...requestOptions } = opts;
    Logger(requestOptions, 'requestOptions', 'trace');

    const response = await this.promisifyRequest({ method: 'GET', ...requestOptions });
    Logger(response, 'response', 'trace');
    return { entity, response };
  };

  // runRequestInParallel = async (requestsOptions, limit = 10) => {
  //   const { parallelLimit } = require('async');
  //   const { map } = require('lodash/fp');
  // };

  promisifyRequest = (requestOptions) => {
    return new Promise((resolve, reject) => {
      request(requestOptions, (err, res, body) => {
        if (err) return reject(err);
        resolve({ ...res, body });
      });
    });
  };
}

class PolarityResponse {
  constructor (apiResponse) {
    this.statusCode = apiResponse.response.statusCode;
    this.body = apiResponse.response.body;
    this.entity = apiResponse.entity;
    this.successfulCodes = [200, 404];
  }

  checkErrorStatus = () => {
    if (!this.successfulCodes.includes(statusCode)) {
      throw new RequestError('Request Failed', this.statusCode, this.body, {
        headers: '********'
      });
    }
  };

  getResultsForEntity = () => {
    this.checkErrorStatus();
    return {
      entity: this.entity,
      data: this.hasEmptyDetails() ? this.emptyResults() : this.lookupResults(this.body)
    };
  };

  createSummary = () => {
    return {
      summary: summary,
      details: null
    };
  };

  // Response formats for integrations
  lookupResults = (body) => {
    return {
      summary: this.createSummary(),
      details: body
    };
  };

  emptyResults = () => {
    return {
      summary: ['No Information Found'],
      details: null
    };
  };

  hasEmptyDetails = () => {
    this.statusCode === 404;
  };
}

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

module.exports = { PolarityRequest, PolarityResponse };
