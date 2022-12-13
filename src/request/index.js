const { parallelLimit } = require('async');
const { map, get } = require('lodash/fp');
const createRequestWithDefaults = require('./createRequestWithDefaults');

const requestWithDefaults = createRequestWithDefaults();

const requestsInParallel = async (
  requestsOptions,
  responseGetPath = 'body',
  limit = 10
) => {
  const unexecutedRequestFunctions = map(
    ({ entity, ...requestOptions }) =>
      async () => {
        const { Logger } = require('../../integration');

        const result = get(responseGetPath, await requestWithDefaults(requestOptions));
        Logger(result, 'result', 'trace');
        return entity ? { entity, result } : result;
      },
    requestsOptions
  );

  return await parallelLimit(unexecutedRequestFunctions, limit);
};

module.exports = { createRequestWithDefaults, requestWithDefaults, requestsInParallel };
