module.exports = {
  extends: [
    'eslint-config-ali/typescript/node',
    "prettier",
    'prettier/@typescript-eslint',
  ],
  rules: {
    'no-await-in-loop': 'off',
  }
};
