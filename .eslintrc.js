/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['@remix-run/eslint-config', '@remix-run/eslint-config/node'],
  plugins: ['testing-library'],
  // Report unused `eslint-disable` comments.
  reportUnusedDisableDirectives: true,
}
