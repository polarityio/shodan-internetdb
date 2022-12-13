'use strict';

const getLookupResults = require('./src/getLookupResults');
const {
  splitOutIgnoredIps,
  standardizeEntityTypes,
  parseErrorToReadableJSON
} = require('./src/dataTransformations');
const { last, slice, concat } = require('lodash/fp');

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
  Logger({ entities }, 'Entities', 'debug');
  try {
    Logger({ entities }, 'Entities', 'debug');

    const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(entities);
    const entitiesWithCustomTypesSpecified = standardizeEntityTypes(entitiesPartition);

    const lookupResults = concat(
      await getLookupResults(entitiesWithCustomTypesSpecified, options),
      ignoredIpLookupResults
    );

    Logger({ lookupResults }, 'Lookup Results', 'trace');
    cb(null, lookupResults);
  } catch (error) {
    const err = parseErrorToReadableJSON(error);

    Logger({ error, formattedError: err }, 'Get Lookup Results Failed', 'error');
    cb({ detail: error.message || 'Lookup Failed', err });
  }
};

module.exports = {
  startup,
  doLookup,
  Logger
};
