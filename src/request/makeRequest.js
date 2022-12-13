const makeRequest = async ({ site, path, options, ...requestOptions }) => {
  const { Logger } = require('../../integration');
  const opts = {
    ...requestOptions,
    url: urlBySite[site] + path
  };
  Logger(opts, 'options', 'trace');
  return opts;
};

const urlBySite = {
  shodanInternetdb: 'https://internetdb.shodan.io'
};

module.exports = makeRequest;
