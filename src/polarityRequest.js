const fs = require('fs');
const request = require('postman-request');
const { getLogger } = require('./logger');

const _configFieldIsValid = (field) => typeof field === 'string' && field.length > 0;
const {
  request: { ca, cert, key, passphrase, rejectUnauthorized, proxy }
} = require('../config/config.js');

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
    this.options = options;
    this.requiresAuthentication = false;
  }

  get = async (opts) => {
    const Logger = getLogger();

    const { entity, ...requestOptions } = opts;
    Logger.trace({ requestOptions }, 'requestOptions', 'trace');

    const response = await this.promisifyRequest({ method: 'GET', ...requestOptions });
    Logger.trace({ response }, `response for ${entity.value}`, 'trace');

    return { entity, response };
  };

  promisifyRequest = (requestOptions) => {
    return new Promise((resolve, reject) => {
      request(requestOptions, (err, res, body) => {
        if (err) return reject(err);
        resolve({ ...res, body });
      });
    });
  };
}

module.exports = PolarityRequest;
