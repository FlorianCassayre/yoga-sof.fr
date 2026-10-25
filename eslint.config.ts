import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import compat from 'eslint-plugin-compat';
import importX from 'eslint-plugin-import-x';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['**/dist', '**/build', '**/coverage', '**/node_modules', '**/.next', '.pnpm-store'],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  // @eslint/js
  {
    extends: [js.configs.recommended],
    rules: {
      'no-useless-rename': 'error',
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: 'import', next: '*' },
        { blankLine: 'any', prev: 'import', next: 'import' },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSQualifiedName[left.name="React"]',
          message:
            "Don't use the global React namespace in types, use `import { ... } from 'react'` instead.",
        },
      ],
    },
  },
  // @eslint/js (plain JS)
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: 'Program', message: 'JS files are not allowed, use TypeScript.' },
      ],
    },
  },
  // typescript-eslint
  {
    extends: [...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser, ...globals.es2023 },
      parserOptions: {
        projectService: {},
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@mui/*/*',
                '!@mui/material/locale',
                '!@mui/x-data-grid/locales',
                '!@mui/x-data-grid/themeAugmentation',
                '!@mui/x-date-pickers/locales',
                '!@mui/x-date-pickers/Adapter*',
              ],
              message: 'Use only barrel imports from @mui/* (e.g. @mui/material).',
            },
          ],
          paths: [
            {
              // Opposite of react/react-in-jsx-scope
              name: 'react',
              importNames: ['default'],
              message: "Don't import React default export.",
            },
          ],
        },
      ],
    },
  },
  // eslint-plugin-react
  {
    extends: [react.configs.flat.recommended!],
    settings: {
      react: {
        version: '19',
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-no-useless-fragment': 'error',
      'react/self-closing-comp': 'error',
      'react/forbid-component-props': [
        'error',
        {
          forbid: [{ propName: 'style', allowedFor: ['FontAwesomeIcon'] }, 'className'],
        },
      ],
      'react/function-component-definition': [
        2,
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/jsx-curly-brace-presence': 'error',
      'react/no-unescaped-entities': 'off',
    },
  },
  // eslint-plugin-react-hooks
  {
    extends: [reactHooks.configs.flat.recommended],
  },
  // eslint-plugin-react-refresh
  {
    extends: [reactRefresh.configs.recommended],
    rules: {
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    },
  },
  // eslint-plugin-simple-import-sort
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  // eslint-plugin-import-x
  {
    extends: [importX.flatConfigs.recommended],
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver()],
    },
    rules: {
      'import-x/no-cycle': 'error',
      'import-x/no-empty-named-blocks': 'error',
      'import-x/no-default-export': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'error',
    },
  },
  // eslint-plugin-import-x (configs, NextJS)
  {
    files: ['**/*.config.ts', 'apps/*/src/app/**/*.@(ts|tsx)'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
  // eslint-plugin-compat
  {
    // Flag browser APIs outside the browserslist range that aren't polyfilled.
    // If a core-js-polyfilled ES API is flagged, add it to settings.polyfills here.
    // This only applies to code that is actually shipped to the browser.
    files: ['apps/*/src/**/*.{ts,tsx}', 'packages/*/src/**/*.{ts,tsx}'],
    extends: [compat.configs['flat/recommended']],
  },
  {
    files: ['**/src/tests/**'],
    rules: {
      'compat/compat': 'off',
    },
  },
  // eslint-config-prettier
  prettier, // Important: this needs to be the last entry
);
