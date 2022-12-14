const { flow, eq, get } = require('lodash/fp');

const { parseErrorToReadableJSON } = require('../../src/dataTransformations');

const handleRequestErrorsForServices =
  (requestWithDefaultsBuilder) => async (error, requestOptions) => {
    return await get(requestOptions.site, authenticationProcessBySite)(
      error,
      requestOptions,
      requestWithDefaultsBuilder
    );
  };

const ignoreErrorSpecialNotFoundResponses = async (error) => {
  const err = parseErrorToReadableJSON(error);
  const isNotFoundError = flow(get('status'), eq(404))(err);

  if (!isNotFoundError) throw error;
};

const authenticationProcessBySite = {
  tenable: ignoreErrorSpecialNotFoundResponses
};

module.exports = handleRequestErrorsForServices;
