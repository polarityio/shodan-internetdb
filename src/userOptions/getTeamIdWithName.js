const { flow, get } = require('lodash/fp');
const { requestWithDefaults } = require('../request');
const { compareStringLetters } = require('./utils');

// REQUEST DOCUMENTATION: https://learn.microsoft.com/en-us/graph/api/teams-list?view=graph-rest-beta&tabs=http
const getTeamIdWithName = async (options) => {
  // const teams = get(
  //   'body.value',
  //   await requestWithDefaults({
  //     method: 'GET',
  //     site: 'teams',
  //     route: 'beta/teams',
  //     options
  //   })
  // );

  // const teamId = flow(
  //   find((team) => compareStringLetters(team.displayName, options.teamName)),
  //   get('id')
  // )(teams);

  return 123//teamId;
};

module.exports = getTeamIdWithName;

/** RESPONSE SHAPE: 
 * {
  "value": [
    {
      "id": "172b0cce-e65d-44ce-9a49-91d9f2e8493a",
      "displayName": "Contoso Team",
      "description": "This is a Contoso team, used to showcase the range of properties supported by this API"
    },
    {
      "id": "890972b0cce-e65d-44ce-9a49-568hhsd7n",
      "displayName": "Contoso General Team",
      "description": "This is a general Contoso team"
    },
    {
      "id": "98678abcce0-e65d-44ce-9a49-9980bj8kl0e",
      "displayName": "Contoso API Team",
      "description": "This is Contoso API team"
    }
  ]
} */
