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
    this.successfulCodes = [200, 404];
    (this.options = options), (this.requiresAuthentication = false);
  }
  /**
   * get
   * @param {object} opts - request options.
   */
  get = async (opts) => {
    const { Logger } = require('../../integration');
    const { entity, ...requestOptions } = opts;
    Logger(requestOptions, 'requestOptions', 'trace');

    const response = await this.promisifyRequest({ method: 'GET', ...requestOptions });
    Logger(response, 'response', 'trace');
    this.checkErrorStatus(response);
    //will return the raw response returned from the API.
    return { entity, response };
  };

  runRequestInParallel = async (requestsOptions, limit = 10) => {
    const { parallelLimit } = require('async');
    const { map } = require('lodash/fp');
  };

  checkErrorStatus = (response) => {
    const { statusCode, body } = response;
    //if its a 200 or 404, we don't want to throw an error
    if (this.successfulCodes.includes(statusCode)) {
      return;
    }

    const requestError = Error('Request Error');

    requestError.status = statusCodeNotSuccessful ? statusCode : body.error;
    requestError.detail = get(get('error', body), ERROR_MESSAGES);
    requestError.description = JSON.stringify(body);
    requestError.requestOptions = JSON.stringify(requestOptionsWithoutSensitiveData);

    throw requestError;
  };

  promisifyRequest = (requestOptions) => {
    return new Promise((resolve, reject) => {
      const { Logger } = require('../../integration');
      Logger(requestOptions, 'requestOptions', 'trace');

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
  }

  getResultsForEntity = () => {
    const { Logger } = require('../../integration');
    Logger({ response: this }, 'Response', 'trace');
    return {
      entity: this.entity,
      data: this.buildDetails(this.body)
    };
  };

  buildDetails = () => {
    return this.hasEmptyDetails() ? this.emptyResults() : this.lookupResults(this.body);
  };

  lookupResults = (body) => {
    return {
      summary: ['Summary'],
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

module.exports = { PolarityRequest, PolarityResponse };
