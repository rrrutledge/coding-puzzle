'use strict';

const js = require('@eslint/js');

module.exports = [
  {
    ignores: ['node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      curly: ['error', 'all'],
      semi: ['error', 'always'],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
];
