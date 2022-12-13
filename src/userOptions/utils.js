const {
  isEmpty,
  get,
  curry,
  flow,
  split,
  map,
  zipObject,
  trim,
  uniq,
  compact,
  first,
  replace
} = require('lodash/fp');
const { transpose2DArray } = require('../dataTransformations');
const reduce = require('lodash/fp/reduce').convert({ cap: false });

const compareStringLetters = (str1, str2) => {
  const getStringLetters = flow(toLower, replace(/\W/gi, ''));
  return getStringLetters(team.displayName) === getStringLetters(options.teamName);
};

const flattenOptions = (options) =>
  reduce(
    (agg, optionObj, optionKey) => ({ ...agg, [optionKey]: get('value', optionObj) }),
    {},
    options
  );

const validateStringOptions = (stringOptionsErrorMessages, options, otherErrors = []) =>
  reduce((agg, message, optionName) => {
    const isString = typeof options[optionName].value === 'string';
    const isEmptyString = isString && isEmpty(options[optionName].value);

    return !isString || isEmptyString
      ? agg.concat({
          key: optionName,
          message
        })
      : agg;
  }, otherErrors)(stringOptionsErrorMessages);

const splitCommaSeparatedUserOption = curry((key, options) =>
  flow(get(key), split(','), map(trim), compact, uniq)(options)
);

const splitCommaSeparatedUserOptionThenFirst = curry((key, options) => [
  first(splitCommaSeparatedUserOption(key, options))
]);

const splitKeyValueCommaSeparatedUserOption = (key, options) =>
  flow(
    splitCommaSeparatedUserOption(key),
    map(flow(split(':'), map(trim))),
    transpose2DArray,
    ([keys, values]) => zipObject(keys, values)
  )(options);

const splitKeyValueCommaSeparatedUserOptionThenFirst = (key, options) =>
  flow(
    splitCommaSeparatedUserOption(key),
    map(flow(split(':'), map(trim))),
    ([first]) => [first],
    transpose2DArray,
    ([keys, values]) => zipObject(keys, values)
  )(options);

const validateUrlOption = ({ value: url }, otherErrors = []) => {
  const endWithError =
    url && url.endsWith('//')
      ? otherErrors.concat({
          key: 'url',
          message: 'Your Url must not end with a //'
        })
      : otherErrors;
  if (endWithError.length) return endWithError;

  if (url) {
    try {
      new URL(url);
    } catch (_) {
      return otherErrors.concat({
        key: 'url',
        message:
          'What is currently provided is not a valid URL. You must provide a valid Instance URL.'
      });
    }
  }

  return otherErrors;
};

module.exports = {
  compareStringLetters,
  flattenOptions,
  validateStringOptions,
  splitCommaSeparatedUserOption,
  splitKeyValueCommaSeparatedUserOption,
  splitCommaSeparatedUserOptionThenFirst,
  splitKeyValueCommaSeparatedUserOptionThenFirst,
  validateUrlOption
};
