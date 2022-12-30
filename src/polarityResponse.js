const { join } = require('lodash/fp');
const { RequestError, ValidationError } = require('./errors');

class PolarityResponse {
  constructor (apiResponse) {
    this.statusCode = apiResponse.response.statusCode;
    this.body = apiResponse.response.body;
    this.entity = apiResponse.entity;
    this.successfulCodes = [200, 404];
    this.netWorkErrorCodes = [400, 500, 502, 503, 504];
    // this.tokenErrorCodes = [401, 403];
    this.validationErrorCodes = [422];
  }

  checkErrorStatus = () => {
    if (this.netWorkErrorCodes.includes(this.statusCode)) {
      throw new RequestError(
        'Error making request to Shodan Context API',
        this.statusCode,
        this.body,
        {
          headers: '********'
        }
      );
    }

    if (this.validationErrorCodes.includes(this.statusCode)) {
      throw new ValidationError('HTTP validation error', this.statusCode, this.body, {
        headers: '********'
      });
    }
  };

  getResultsForEntity = () => {
    this.checkErrorStatus();

    return {
      entity: this.entity,
      data: this.hasEmptyDetails() ? null : this.lookupResults()
    };
  };

  createSummary = () => {
    return [
      `Ports: ${join(',', this.body.ports)}${this.body.ports.length === 4 ? '...' : ''}`
    ];
  };

  // Response formats for integrations
  lookupResults = () => ({ summary: this.createSummary(), details: this.body });

  hasEmptyDetails = () => this.statusCode === 404;
}

module.exports = PolarityResponse;
