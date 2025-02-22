import { typescript } from '@frsource/eslint-config'
import globals from 'globals'

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  ...typescript,
  { ignores: ['**/dist', '**/coverage', '**/node_modules'] },
  {
    files: ['src/**'],
    languageOptions: {
      globals: {
        ...globals.es2021,
        ...globals.browser,
      },
    },
  },
]
