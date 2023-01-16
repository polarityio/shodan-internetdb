/**
 * Return a Result Object or a Result Miss Object based on the REST API response.
 *
 * @param entity - entity object
 * @param apiResponse - response object from API Rest request
 * @returns {{data: null, entity}|{data: {summary: [string], details}, entity}}
 */
const createResultObject = (entity, apiResponse) => {
  if (isMiss(apiResponse)) {
    return {
      entity,
      data: null
    };
  }

  return {
    entity,
    data: {
      summary: createSummary(apiResponse),
      details: apiResponse.body
    }
  };
};

/**
 * Shodan Context API returns a 404 status code if a particular IP has no data on it.
 * Note that this statusCode does not appear to be documented.
 *
 * @param apiResponse
 * @returns {boolean}
 */
const isMiss = (apiResponse) => apiResponse.statusCode === 404;

/**
 * Create the Port Summary Tags
 *
 * Sort the ports when displaying from smallest to largest number
 *
 * If there are less than or equal to 10 ports just show the ports like we currently do (however, they will now be sorted)
 * If there are greater than 10 ports do the following:
 *   1. Sort the ports and ensure we're displaying ports under 1024 before ports over 1024.
 *   2. Display the first 10 ports less than 1024 and then text that says +X more.
 *   These are called Reserved Ports (note that reserved ports are 0 to 1023 inclusive)
 *
 * Example:
 * ```
 * Reserved Ports: 1, 2, 3, 4, 25, 80, 443, 500, 600, 601, +5 more
 * ```
 * Add a second tag that provides a count of how many ports greater than or equal to 1024 are open
 * (these are called ephemeral ports).
 *
 * Example:
 * ```
 * 679 ephemeral ports
 * ```
 * @param apiResponse
 * @returns {[string]}
 */
const createPortTags = (apiResponse) => {
  const portTags = [];
  const ports = Array.from(apiResponse.body.ports);

  // sort the ports from smallest to largest
  ports.sort((a, b) => {
    return a - b;
  });

  if (ports.length === 0) {
    return [`No Open Ports`];
  } else if (ports.length <= 10) {
    return [`Ports: ${ports.join(', ')}`];
  } else {
    let splitIndex = ports.length;
    for (let i = 0; i < ports.length; i++) {
      if (ports[i] > 1024) {
        splitIndex = i;
        break;
      }
    }

    // ports array is for reserved ports
    // ephemeralPorts is for ephemeral ports ( ports > 1024)
    const ephemeralPorts = ports.splice(splitIndex);

    const numEphemeralPorts = ephemeralPorts.length;
    const firstTenReservedPorts = ports.slice(0, 10);
    //const firstFiveEphemeralPorts = ephemeralPorts.slice(0, 5);
    const extraReservedCount = ports.length > 10 ? ports.length - 10 : 0;
    //const extraEphemeralCount = ephemeralPorts.length > 5 ? ephemeralPorts.length - 5 : 0;

    if (firstTenReservedPorts.length > 0) {
      portTags.push(
        `Reserved Ports: ${firstTenReservedPorts.join(', ')}${
          extraReservedCount > 0 ? ', +' + extraReservedCount + ' more' : ''
        }`
      );
    }

    if (numEphemeralPorts > 0) {
      portTags.push(`${numEphemeralPorts} ephemeral ports`);
    }
    //
    // if (firstFiveEphemeralPorts.length > 0) {
    //   portTags.push(
    //     `Ephemeral Ports: ${firstFiveEphemeralPorts.join(', ')}${
    //       extraEphemeralCount > 0 ? ', +' + extraEphemeralCount + ' more' : ''
    //     }`
    //   );
    // }

    return portTags;
  }
};

/**
 * Creates the Summary Tags (currently just tags for ports)
 * @param apiResponse
 * @returns {string[]}
 */
const createSummary = (apiResponse) => {
  const tags = createPortTags(apiResponse);

  if (Array.isArray(apiResponse.body.tags)) {
    const apiTags = apiResponse.body.tags;
    apiTags.slice(0, 5).forEach((tag) => {
      tags.push(tag);
    });
    if (apiTags.length > 5) {
      tags.push(`+${apiTags.length - 5} more tags`);
    }
  }
  return tags;
};

module.exports = {
  createResultObject,
  createSummary,
  createPortTags
};
