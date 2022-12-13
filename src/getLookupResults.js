const createLookupResults = require('./createLookupResults');
const { searchIps } = require('./queries');

const getLookupResults = async (entities, options) => {
  const searchedIps = await searchIps(entities);
  const lookupResults = createLookupResults(entities, searchedIps, options);

  return lookupResults;
};

module.exports = getLookupResults;
