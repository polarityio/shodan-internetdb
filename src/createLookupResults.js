const { flow, get, size, find, eq, map } = require('lodash/fp');

const createLookupResults = (entities, searchedIps, options) =>
  map((entity) => {
    const resultsForThisEntity = getResultsForThisEntity(entity, searchedIps, options);
    // handles the case of an ip not being found, the response will be a 404, and an object with a detail property: 
    // { detail: No information available' || 'Not Found' }
    const noInformationFound = resultsForThisEntity.searchedIps.detail ? true : false;

    const lookupResult = {
      entity,
      data: !noInformationFound
        ? {
            summary: createSummaryTags(resultsForThisEntity, options),
            details: resultsForThisEntity
          }
        : null
    };

    return lookupResult;
  }, entities);

const getResultsForThisEntity = (entity, searchIps) => {
  const getResultForThisEntityResult = (results) =>
    flow(find(flow(get('entity.value'), eq(entity.value))), get('result'))(results);

  const searchedIps = getResultForThisEntityResult(searchIps);

  return {
    ...(!!size(searchedIps) && { searchedIps })
  };
};

const createSummaryTags = (resultsForThisEntity) => {
  const tags = [];

  tags.push(
    `Ports: ${resultsForThisEntity.searchedIps.ports.join(',')}${
      resultsForThisEntity.searchedIps.ports.length === 4 ? '...' : ''
    }`
  );
  return tags;
};

module.exports = createLookupResults;