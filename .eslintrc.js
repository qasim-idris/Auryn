module.exports = {
  parser:  "@typescript-eslint/parser",
  extends:  [
    "eslint:recommended",
    "prettier/@typescript-eslint",
    "plugin:jest/recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: [
    "react",
    "react-native",
    "@typescript-eslint",
    "jest",
    "prettier",
    "import"
  ],
  env: {
    "browser": true,
    "node": true,
    "es6": true
  },
  parserOptions: {
    "emcaVersion": 9,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  globals: {
    "fetch": false
  },
  settings: {
    react: {
      "version": "detect"
    }
  },
  overrides: [
    {
      "files": ["*.js"],
      "rules": {
        "@typescript-eslint/no-var-requires": "off"
      }
    }
  ],
  rules: {
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "no-case-declarations": "off",
    "react/prop-types": "off",
    "jest/no-mocks-import": "off",
    "indent": "off",
    "@typescript-eslint/indent": ["error", 2]
  }
}
