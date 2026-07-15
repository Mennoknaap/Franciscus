const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const stylistic = require('@stylistic/eslint-plugin');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    ignores: [
      '**/apiclients/**/*.ts'
    ],
    plugins: {
      '@stylistic/js': stylistic,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': ['error', {
        type: 'attribute',
        prefix: 'app',
        style: 'camelCase',
      }],
      '@angular-eslint/component-selector': ['error', {
        type: 'element',
        prefix: 'app',
        style: 'kebab-case',
      }],

      '@typescript-eslint/naming-convention': ['error',
        {
          selector: 'parameter',
          leadingUnderscore: 'allow',
          format: ['camelCase'],
        }, {
          selector: 'variable',
          leadingUnderscore: 'allow',
          format: ['camelCase', 'UPPER_CASE'],
        }, {
          selector: "property",
          modifiers: ["private"],
          format: ["camelCase"],
          leadingUnderscore: "require"
        },
        {
          selector: "method",
          modifiers: ["private"],
          format: ["camelCase"],
          leadingUnderscore: "forbid"
        }
      ],

      '@stylistic/js/max-len': ['error', {
        code: 360,
        ignorePattern: '^import|d=|path=|polygon|data:image|^export',
      }],

      'no-multiple-empty-lines': ['error', {
        max: 1,
        maxEOF: 0,
        maxBOF: 0,
      }],
      'no-irregular-whitespace': ['error', {
        skipStrings: false,
      }],

      '@typescript-eslint/array-type': ['error'],
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/no-undef': ['off'],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@angular-eslint/prefer-standalone': ['off'],


      '@stylistic/js/array-bracket-spacing': ['error'],
      '@stylistic/js/arrow-spacing': ['error'],
      '@stylistic/js/block-spacing': ['error'],
      '@stylistic/js/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/js/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/js/comma-spacing': ['error'],
      '@stylistic/js/comma-style': ['error'],
      '@stylistic/js/curly-newline': ['error'],
      '@stylistic/js/dot-location': ['error', 'property'],
      '@stylistic/js/eol-last': ['error'],
      '@stylistic/js/function-call-spacing': ['error'],
      '@stylistic/js/indent': ['error', 4, { SwitchCase: 1 }],
      '@stylistic/js/key-spacing': ['error', { 'beforeColon': false }],
      '@stylistic/js/keyword-spacing': ['error'],
      '@stylistic/js/linebreak-style': ['error', 'windows'],
      '@stylistic/js/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      '@stylistic/js/no-extra-parens': ['error'],
      '@stylistic/js/no-extra-semi': ['error'],
      '@stylistic/js/no-multi-spaces': ['error'],
      '@stylistic/js/no-trailing-spaces': ['error', { skipBlankLines: false, ignoreComments: false }],
      '@stylistic/js/no-whitespace-before-property': ['error'],
      '@stylistic/js/nonblock-statement-body-position': ['error', 'below'],
      '@stylistic/js/object-curly-spacing': ['error', 'always'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/rest-spread-spacing': ['error'],
      '@stylistic/js/semi-spacing': ['error'],
      '@stylistic/js/semi-style': ['error'],
      '@stylistic/js/semi': ['error', 'always'],
      '@stylistic/js/space-before-blocks': ['error'],
      '@stylistic/js/space-before-function-paren': ['error', { anonymous: 'always', named: 'never' }],
      '@stylistic/js/space-in-parens': ['error', 'never'],
      '@stylistic/js/space-infix-ops': ['error'],
      '@stylistic/js/space-unary-ops': ['error', { words: true, nonwords: false }],
      '@stylistic/js/spaced-comment': ['error', 'always', { markers: ['/'] }],
      '@stylistic/js/switch-colon-spacing': ['error'],
      '@stylistic/js/template-curly-spacing': ['error', 'never'],
      '@stylistic/js/type-annotation-spacing': ['error'],
      '@stylistic/js/type-generic-spacing': ['error'],

      '@angular-eslint/prefer-output-emitter-ref': ['error'],
      '@angular-eslint/prefer-signals': ['error', { preferReadonlySignalProperties: false }],

      'arrow-parens': ['error', 'as-needed'],
      'constructor-super': ['error'],
      'curly': ['error', 'multi-or-nest', 'consistent'],
      'max-lines': ['warn', 500],
      'no-debugger': ['error'],
      'no-duplicate-case': ['error'],
      'no-empty': ['error'],
      'no-fallthrough': ['error'],
      'no-unneeded-ternary': ['error'],
      'no-var': ['error'],
      'radix': ['error', 'as-needed'],
    },
  },
);