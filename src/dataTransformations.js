const _ = require('lodash');
const {
  flow,
  keys,
  values,
  zipObject,
  map,
  first,
  omit,
  reduce,
  size,
  negate,
  curry,
  filter,
  eq,
  isEmpty,
  get,
  isArray,
  identity,
  join,
  split,
  getOr,
  last,
  trim,
  reverse,
  slice,
  flatMap
} = require('lodash/fp');

const { IGNORED_IPS } = require('./constants');

const getKeys = (keys, items) =>
  Array.isArray(items)
    ? items.map((item) => _.pickBy(item, (v, key) => keys.includes(key)))
    : _.pickBy(items, (v, key) => keys.includes(key));

const groupEntities = (entities) =>
  _.chain(entities)
    .groupBy(({ isIP, isDomain, type }) =>
      isIP
        ? 'ip'
        : isDomain
        ? 'domain'
        : type === 'MAC'
        ? 'mac'
        : type === 'MD5'
        ? 'md5'
        : type === 'SHA1'
        ? 'sha1'
        : type === 'SHA256'
        ? 'sha256'
        : 'unknown'
    )
    .omit('unknown')
    .value();

const splitOutIgnoredIps = (_entitiesPartition) => {
  const { ignoredIPs, entitiesPartition } = _.groupBy(
    _entitiesPartition,
    ({ isIP, value }) =>
      !isIP || (isIP && !IGNORED_IPS.has(value)) ? 'entitiesPartition' : 'ignoredIPs'
  );

  return {
    entitiesPartition,
    ignoredIpLookupResults: _.map(ignoredIPs, (entity) => ({
      entity,
      data: null
    }))
  };
};

const objectPromiseAll = async (obj = { fn1: async () => {} }) => {
  const labels = keys(obj);
  const functions = values(obj);
  const executedFunctions = await Promise.all(map((func) => func(), functions));

  return zipObject(labels, executedFunctions);
};

const asyncObjectReduce = async (func, initAgg, obj) => {
  const nextKey = flow(keys, first)(obj);

  if (!nextKey) return initAgg;

  const newAgg = await func(initAgg, obj[nextKey], nextKey);

  return await asyncObjectReduce(func, newAgg, omit(nextKey, obj));
};

const transpose2DArray = reduce(
  (agg, [key, value]) => [
    [...agg[0], key],
    [...agg[1], value]
  ],
  [[], []]
);

const or =
  (...[func, ...funcs]) =>
  (x) =>
    func(x) || (funcs.length && or(...funcs)(x));

const and =
  (...[func, ...funcs]) =>
  (x) =>
    func(x) && (funcs.length ? and(...funcs)(x) : true);

// func: (value, key) => [newKey, newValue], obj: { key1:value1, key2:value2 }
// return { newKey1: newValue1, newKey2: newValue2 }
const mapObject = curry((func, obj) =>
  flow(
    Object.entries,
    map(([key, value]) => func(value, key)),
    filter(and(negate(isEmpty), flow(size, eq(2)))),
    transpose2DArray,
    ([keys, values]) => zipObject(keys, values)
  )(obj)
);

const mapObjectAsync = async (func, obj) => {
  // func: (value, key) => [newKey, newValue], obj: { key1:value1, key2:value2 }
  // return { newKey1: newValue1, newKey2: newValue2 }
  const unzippedResults = await Promise.all(
    map(async ([key, value]) => await func(value, key), Object.entries(obj))
  );

  return flow(
    filter(and(negate(isEmpty), flow(size, eq(2)))),
    transpose2DArray,
    ([keys, values]) => zipObject(keys, values)
  )(unzippedResults);
};

const parseErrorToReadableJSON = (error) =>
  JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));

const millisToHoursMinutesAndSeconds = (millis) => {
  let remainingMillis = millis;

  const seconds = Math.floor((remainingMillis / 1000) % 60);
  remainingMillis -= seconds * 1000;

  const minutes = Math.floor((remainingMillis / 60000) % 60);
  remainingMillis -= minutes * 60000;

  const hours = Math.floor(remainingMillis / 3600000);

  return (
    (hours ? `${hours} hours, ` : '') +
    (minutes ? `${minutes} minutes, ` : '') +
    (seconds ? `${seconds} seconds` : '') +
    (!hours && !minutes && !seconds ? `${millis}ms` : '')
  );
};

// const standardizePossibleXmlList = (arrayOrObject) =>
//   arrayOrObject &&
//   JSON.stringify(isArray(arrayOrObject) ? arrayOrObject : [arrayOrObject]);

// const xml2js = require('xml2js');

// const xmlToJson = async (xml) => {
//   try {
//     const parser = new xml2js.Parser({
//       normalizeTags: true,
//       explicitArray: false,
//       charkey: 'value',
//       attrkey: 'attributes'
//     });
//     return await parser.parseStringPromise(xml);
//   } catch (e) {
//     const err = parseErrorToReadableJSON(e);
//     console.error({ MESSAGE: 'Failed to Parse XML', xml, err });
//   }
// };

const sleep = async (ms = 2000) => new Promise((r) => setTimeout(r, ms));

const getSetCookies = flow(get('set-cookie'), map(flow(split('; '), first)), join('; '));

const encodeBase64 = (str) => str && Buffer.from(str).toString('base64');

const decodeBase64 = (str) => str && Buffer.from(str, 'base64').toString('ascii');

const standardizeEntityTypes = (entities) =>
  map(
    ({ type, types, ...entity }) => ({
      ...entity,
      type: type === 'custom' ? flow(first, split('.'), last)(types) : type
    }),
    entities
  );

// allCombinations(['a', 'b'], [[1,2],[4,5]]) --> outputs [ { a: 1, b: 4 }, { a: 1, b: 5 }, { a: 2, b: 4 }, { a: 2, b: 5 } ]
const allCombinations = (
  [dimensionName, ...remainingDimensionNames],
  [arrayToCombine, ...remainingArraysToCombine],
  agg = {}
) =>
  flatMap(
    (item) =>
      size(remainingArraysToCombine)
        ? allCombinations(remainingDimensionNames, remainingArraysToCombine, {
            ...agg,
            [dimensionName]: item
          })
        : {
            ...agg,
            [dimensionName]: item
          },
    arrayToCombine
  );

const buildLogger = (logger, ...args) =>
  logger[
    ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(last(args))
      ? last(args)
      : 'info'
  ](slice(0, -1, args));

module.exports = {
  getKeys,
  groupEntities,
  splitOutIgnoredIps,
  objectPromiseAll,
  asyncObjectReduce,
  mapObject,
  mapObjectAsync,
  transpose2DArray,
  parseErrorToReadableJSON,
  millisToHoursMinutesAndSeconds,
  // standardizePossibleXmlList,
  // xmlToJson,
  and,
  or,
  sleep,
  getSetCookies,
  encodeBase64,
  decodeBase64,
  standardizeEntityTypes,
  allCombinations,
  buildLogger
};
