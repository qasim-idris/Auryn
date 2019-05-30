global.navigation = {
  addListener: jest.fn(),
  isFocused: jest.fn(),
  navigate: jest.fn(),
};

global.fetch = require('jest-fetch-mock');
