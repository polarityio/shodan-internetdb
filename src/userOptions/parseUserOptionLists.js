const { splitCommaSeparatedUserOption } = require('./utils');
const getTeamIdWithName = require('./getTeamIdWithName');

const parseUserOptionLists = async (options) => {
  const parsedChannelNames = splitCommaSeparatedUserOption('channelNames', options);

  const teamId = await getTeamIdWithName(options);

  const updatedOptions = {
    ...options,
    parsedChannelNames,
    teamId
  };

  return updatedOptions;
};

module.exports = parseUserOptionLists;
