/*
 * Copyright (c) 2023, Polarity.io, Inc.
 */
const { getLogger } = require('./logger');
const { ApiRequestError } = require('./errors');
const polarityRequest = require('./polarityRequest');
const SUCCESS_CODES = [200, 404];


const fetchIpContext = async (ip) => {
  const Logger = getLogger();
  const request = new PolarityRequestWithAuth(userOptions);
  const apiResponse = await polarityRequest.request({
    uri: `https://internetdb.shodan.io/${ip}`
  });

  Logger.trace({ apiResponse }, 'Lookup API Response');

  // Handle API errors
  if (!SUCCESS_CODES.includes(apiResponse.statusCode)) {
    throw new ApiRequestError(
      `Unexpected status code ${apiResponse.statusCode} received when making request to Shodan Context API`,
      {
        statusCode: apiResponse.statusCode,
        requestOptions: apiResponse.requestOptions
      }
    );
  }
};

module.exports = fetchIpContext;
