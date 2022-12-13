const { map } = require('lodash/fp');
const { requestsInParallel } = require('../request');


const searchIps = async (entities) => {
  const { Logger } = require('../../integration');
  const queryRequestOptions = map(
    (entity) => ({
      entity,
      method: 'GET',
      site: 'shodanInternetdb',
      path: `/${entity.value}`
    }),
    entities
  );
  Logger(queryRequestOptions, 'search ip options', 'trace');

  const queryResults = await requestsInParallel(queryRequestOptions, 'body');

  Logger(queryResults, 'searched ips', 'trace');
  return queryResults;
};

module.exports = searchIps;

/* 
RESPONSE: 
      "result": {
        "cpes": [],
        "hostnames": ["one.one.one.one"],
        "ip": "1.1.1.1",
        "ports": [53, 80, 443],
        "tags": [],
        "vulns": []
      }
*/
