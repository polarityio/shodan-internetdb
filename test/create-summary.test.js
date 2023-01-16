const { createPortTags } = require('../src/create-result-object');

test(`No ports displays no ports tag`, () => {
  expect.assertions(1);
  // Return a valid token but we'll simulate it being invalid
  const apiResponse = {
    body: {
      ports: []
    }
  };

  const summary = createPortTags(apiResponse);

  expect(summary).toEqual(['No Open Ports']);
});

test(`Less than 10 ports are displayed as is but sorted from least to greatest`, () => {
  expect.assertions(1);
  // Return a valid token but we'll simulate it being invalid
  const apiResponse = {
    body: {
      ports: [50, 40, 45, 10, 2, 5, 34, 1024, 50000, 65000]
    }
  };

  const summary = createPortTags(apiResponse);

  expect(summary).toEqual(['Ports: 2, 5, 10, 34, 40, 45, 50, 1024, 50000, 65000']);
});

test(`More than 10 reserved ports display first 10 sorted from least to greatest`, () => {
  expect.assertions(1);
  // Return a valid token but we'll simulate it being invalid
  const apiResponse = {
    body: {
      ports: [50, 40, 45, 10, 2, 5, 34, 1024, 25, 80, 443, 51]
    }
  };

  const summary = createPortTags(apiResponse);

  expect(summary).toEqual([
    'Reserved Ports: 2, 5, 10, 25, 34, 40, 45, 50, 51, 80, +2 more'
  ]);
});

test(`More than 10 ephemeral ports display first 5 sorted from least to greatest`, () => {
  expect.assertions(1);
  // Return a valid token but we'll simulate it being invalid
  const apiResponse = {
    body: {
      ports: [5000, 4000, 4500, 10000, 2000, 5000, 3400, 10240, 2500, 8000, 4430, 5100]
    }
  };

  const summary = createPortTags(apiResponse);

  expect(summary).toEqual(['12 ephemeral ports']);
});

test(`1 reserved and more than 10 ephemeral ports display first 5 of each sorted from least to greatest`, () => {
  expect.assertions(1);
  // Return a valid token but we'll simulate it being invalid
  const apiResponse = {
    body: {
      ports: [
        443, 5000, 4000, 4500, 10000, 2000, 5000, 3400, 10240, 2500, 8000, 4430, 5100
      ]
    }
  };

  const summary = createPortTags(apiResponse);

  expect(summary).toEqual(['Reserved Ports: 443', '12 ephemeral ports']);
});

test(`10 reserved and more than 10 ephemeral ports display first 5 of each sorted from least to greatest`, () => {
  expect.assertions(1);
  // Return a valid token but we'll simulate it being invalid
  const apiResponse = {
    body: {
      ports: [
        25, 1, 2, 4, 5, 26, 27, 28, 29, 30, 5000, 4000, 4500, 10000, 2000, 5000, 3400,
        10240, 2500, 8000, 4430, 5100
      ]
    }
  };

  const summary = createPortTags(apiResponse);

  expect(summary).toEqual([
    'Reserved Ports: 1, 2, 4, 5, 25, 26, 27, 28, 29, 30',
    '12 ephemeral ports'
  ]);
});

test(`11 reserved and more than 10 ephemeral ports display first 5 of each sorted from least to greatest`, () => {
  expect.assertions(1);
  // Return a valid token but we'll simulate it being invalid
  const apiResponse = {
    body: {
      ports: [
        25, 1, 2, 4, 5, 26, 27, 28, 29, 30, 31, 5000, 4000, 4500, 10000, 2000, 5000, 3400,
        10240, 2500, 8000, 4430, 5100
      ]
    }
  };

  const summary = createPortTags(apiResponse);

  expect(summary).toEqual([
    'Reserved Ports: 1, 2, 4, 5, 25, 26, 27, 28, 29, 30, +1 more',
    '12 ephemeral ports'
  ]);
});