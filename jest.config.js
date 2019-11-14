const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  ...tsjPreset,
  automock: false,
  setupFiles: ['<rootDir>/jest.setup.js'],
  preset: '@youi/react-native-youi',
  transform: {
    ...tsjPreset.transform,
    '\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  globals: {
    'ts-jest': {
      babelConfig: true,
      diagnostics: false,
    },
  },
  transformIgnorePatterns: ['node_modules/(?!(jest-)?react-native|react-navigation|@youi)'],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
  ],
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
  testPathIgnorePatterns: [
    '\\.snap$',
    '<rootDir>/node_modules/',
  ],
  cacheDirectory: '.jest/cache',
};
