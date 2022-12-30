'use strict';

const { parseErrorToReadableJSON } = require('./src/dataTransformations');
const PolarityRequest = require('./src/polarityRequest');
const PolarityResponse = require('./src/polarityResponse');
const { setLogger } = require('./src/logger');

let Logger = null;

const startup = (logger) => {
  Logger = logger;
  setLogger(Logger);
};

const doLookup = async (entities, options, cb) => {
  try {
    Logger.trace({ entities }, 'Entities', 'debug');

    const lookupResults = await Promise.all(
      entities.map(async (entity) => {
        return await getLookupResults(entity, options);
      })
    );

    Logger.trace({ lookupResults }, 'Lookup Results', 'trace');
    cb(null, lookupResults);
  } catch (error) {
    const err = parseErrorToReadableJSON(error);

    Logger.trace({ error, formattedError: err }, 'Get Lookup Results Failed', 'error');
    cb({ detail: error.message || 'Lookup Failed', err });
  }
};

const getLookupResults = async (entity, options) => {
  const shodanContextApiRequest = new PolarityRequest(options);

  const shodanContextApiResponse = await shodanContextApiRequest.get({
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
