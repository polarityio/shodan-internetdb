'use strict';

const {
  splitOutIgnoredIps,
  parseErrorToReadableJSON
} = require('./src/dataTransformations');
const { last, slice } = require('lodash/fp');
const {
  PolarityRequest,
  PolarityResponse
} = require('./src/request/createRequestWithDefaults');

let logger = console;

const startup = (_logger) => {
  logger = _logger;
};

const Logger = (...args) => {
  const lastArg = last(args);
  const lastArgIsLevel = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(
    lastArg
  );
  const loggingLevel = lastArgIsLevel ? lastArg : 'info';
  const logArgs = lastArgIsLevel ? slice(0, -1, args) : args;
  logger[loggingLevel](...logArgs);
};

const doLookup = async (entities, options, cb) => {
  try {
    Logger({ entities }, 'Entities', 'debug');

    const lookupResults = await Promise.all(
      entities.map(async (entity) => {
        return await getLookupResults(entity, options);
      })
    );

    Logger({ lookupResults }, 'Lookup Results', 'trace');
    cb(null, lookupResults);
  } catch (error) {
    const err = parseErrorToReadableJSON(error);

    Logger({ error, formattedError: err }, 'Get Lookup Results Failed', 'error');
    cb({ detail: error.message || 'Lookup Failed', err });
  }
};

const getLookupResults = async (entity, options) => {
  const polarityRequest = new PolarityRequest(options);

  const shodanContextApiResponse = await polarityRequest.get({
    entity,
    uri: `${options.url}/${entity.value}`,
    json: true
  });

  const polarityResponse = new PolarityResponse(shodanContextApiResponse);
  return polarityResponse.getResultsForEntity();
};

module.exports = {
  startup,
  doLookup,
  Logger
};
