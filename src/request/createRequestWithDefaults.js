const fs = require('fs');

const request = require('postman-request');
const { get, identity } = require('lodash/fp');

const { ERROR_MESSAGES } = require('../../src/constants');
const makeRequest = require('./makeRequest');
const handleRequestErrorsForServices = require('./handleRequestErrorsForServices');

const SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES = [200, 404];

const _configFieldIsValid = (field) => typeof field === 'string' && field.length > 0;

const createRequestWithDefaults = () => {
  const {
    request: { ca, cert, key, passphrase, rejectUnauthorized, proxy }
  } = require('../../config/config.js');

  const defaults = {
    ...(_configFieldIsValid(ca) && { ca: fs.readFileSync(ca) }),
    ...(_configFieldIsValid(cert) && { cert: fs.readFileSync(cert) }),
    ...(_configFieldIsValid(key) && { key: fs.readFileSync(key) }),
    ...(_configFieldIsValid(passphrase) && { passphrase }),
    ...(_configFieldIsValid(proxy) && { proxy }),
    ...(typeof rejectUnauthorized === 'boolean' && { rejectUnauthorized }),
    rejectUnauthorized: false,
    json: true
  };

  const requestWithDefaultsBuilder = (
    preRequestFunction = async () => ({}),
    postRequestSuccessFunction = async (x) => x,
    postRequestFailureFunction = async (e) => {
      throw e;
    }
  ) => {
    const defaultsRequest = request.defaults(defaults);

    const _requestWithDefaults = (requestOptions) =>
      new Promise((resolve, reject) => {
        const { Logger } = require('../../integration');
        Logger(requestOptions, 'FFFFFFF', 'trace');
        defaultsRequest(requestOptions, (err, res, body) => {
          if (err) return reject(err);
          resolve({ ...res, body });
        });
      });

    return async (requestOptions) => {
      const preRequestFunctionResults = await preRequestFunction(requestOptions);

      const _requestOptions = {
        ...requestOptions,
        ...preRequestFunctionResults
      };

      let postRequestFunctionResults;
      try {
        const result = await _requestWithDefaults(_requestOptions);

        checkForStatusError(result, _requestOptions);

        postRequestFunctionResults = await postRequestSuccessFunction(
          result,
          _requestOptions
        );
      } catch (error) {
        postRequestFunctionResults = await postRequestFailureFunction(
          error,
          _requestOptions
        );
      }
      return postRequestFunctionResults;
    };
  };

  const checkForStatusError = ({ statusCode, body }, requestOptions) => {
    const { Logger } = require('../../integration');

    const requestOptionsWithoutSensitiveData = {
      ...requestOptions,
      options: '{...}',
      headers: {
        ...requestOptions.headers
        // Authorization: 'Bearer ****************'
      }
    };

    const noInformationFound = body.detail === 'No information available' || 'Not Found';

    if (noInformationFound) return;

    Logger(
      {
        MESSAGE: 'Request Ran, Checking Status...',
        statusCode,
        requestOptions: requestOptionsWithoutSensitiveData,
        responseBody: JSON.stringify(body, null, 2)
      },
      'trace'
    );

    const roundedStatus = Math.round(statusCode / 100) * 100;
    const statusCodeNotSuccessful =
      !SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES.includes(roundedStatus);

    if (statusCodeNotSuccessful) {
      const requestError = Error('Request Error');
      requestError.status = statusCodeNotSuccessful ? statusCode : body.error;
      requestError.detail = get(get('error', body), ERROR_MESSAGES);
      requestError.description = JSON.stringify(body);
      requestError.requestOptions = JSON.stringify(requestOptionsWithoutSensitiveData);
      throw requestError;
    }
  };

  const requestDefaultsWithInterceptors = requestWithDefaultsBuilder(
    makeRequest,
    identity,
    handleRequestErrorsForServices(requestWithDefaultsBuilder)
  );

  return requestDefaultsWithInterceptors;
};

module.exports = createRequestWithDefaults;
