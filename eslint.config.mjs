import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const RELATIVE_IMPORT_MESSAGE =
  'Use absolute imports via @/ or @server/. Same-folder relative imports are allowed only for index.ts barrel re-exports.';

function isPascalCase(name) {
  return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

function nodeContainsJsx(node, seen = new WeakSet()) {
  if (!node || typeof node !== 'object') {
    return false;
  }

  if (seen.has(node)) {
    return false;
  }

  seen.add(node);

  if (node.type === 'JSXElement' || node.type === 'JSXFragment') {
    return true;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent') {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.some((child) => nodeContainsJsx(child, seen))) {
        return true;
      }
      continue;
    }

    if (nodeContainsJsx(value, seen)) {
      return true;
    }
  }

  return false;
}

const dashboardPlugin = {
  rules: {
    'no-multi-comp': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Disallow declaring more than one React component in a file',
        },
        schema: [],
        messages: {
          multiple:
            'Move {{name}} into its own file. App code may define only one component per file.',
        },
      },
      create(context) {
        const candidates = [];

        function addCandidate(nameNode, functionNode) {
          if (!nameNode || nameNode.type !== 'Identifier') {
            return;
          }

          if (!isPascalCase(nameNode.name)) {
            return;
          }

          if (!nodeContainsJsx(functionNode.body)) {
            return;
          }

          candidates.push(nameNode);
        }

        return {
          FunctionDeclaration(node) {
            addCandidate(node.id, node);
          },
          VariableDeclarator(node) {
            if (
              !node.init ||
              (node.init.type !== 'ArrowFunctionExpression' &&
                node.init.type !== 'FunctionExpression')
            ) {
              return;
            }

            addCandidate(node.id, node.init);
          },
          'Program:exit'() {
            for (const candidate of candidates.slice(1)) {
              context.report({
                node: candidate,
                messageId: 'multiple',
                data: { name: candidate.name },
              });
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/drizzle/**',
      '**/site/**',
      '**/bin/**',
      'eslint.config.mjs',
      'postcss.config.mjs',
    ],
  },

  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  eslintConfigPrettier,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    plugins: {
      dashboard: dashboardPlugin,
      unicorn,
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'no-ternary': 'error',
      'no-nested-ternary': 'error',

      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: false, allowAny: false, allowNullish: false },
      ],
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/method-signature-style': ['error', 'property'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      'no-magic-numbers': [
        'warn',
        {
          ignore: [0, 1, -1],
          ignoreArrayIndexes: true,
          ignoreDefaultValues: true,
          ignoreNumericLiteralTypes: true,
          enforceConst: true,
        },
      ],

      curly: ['error', 'all'],
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'no-unneeded-ternary': 'error',
      'no-useless-return': 'error',

      'no-param-reassign': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      eqeqeq: ['error', 'always'],

      'no-eval': 'error',
      'no-new-func': 'error',
      'no-return-assign': 'error',

      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-template': 'error',
      'no-useless-concat': 'error',
      'no-useless-rename': 'error',

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*'],
              message: RELATIVE_IMPORT_MESSAGE,
            },
          ],
        },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      'unicorn/prefer-node-protocol': 'error',
      'unicorn/no-array-for-each': 'error',
      'unicorn/no-useless-undefined': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      'unicorn/prefer-string-slice': 'error',
      'unicorn/throw-new-error': 'error',
      'unicorn/prefer-number-properties': 'error',
      'unicorn/no-array-push-push': 'error',
      'unicorn/prefer-spread': 'error',
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-includes': 'error',
      'unicorn/no-for-loop': 'error',
      'unicorn/prefer-set-has': 'error',
      'unicorn/prefer-type-error': 'error',
      'unicorn/no-instanceof-array': 'error',
      'unicorn/error-message': 'error',
      'unicorn/no-typeof-undefined': 'error',
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/prefer-at': 'error',
    },
  },

  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.ts', 'vite.config.ts'],
    rules: {
      curly: 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'unicorn/prefer-number-properties': 'off',
    },
  },

  {
    files: ['src/client/components/**/*.{ts,tsx}', 'src/client/pages/**/*.tsx'],
    rules: {
      'dashboard/no-multi-comp': 'error',
    },
  },

  {
    files: ['src/client/components/ui/**/*.{ts,tsx}'],
    rules: {
      'dashboard/no-multi-comp': 'off',
    },
  },

  {
    files: ['**/index.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: RELATIVE_IMPORT_MESSAGE,
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/cli.ts'],
    rules: {
      'no-console': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./*', '../*', '!../package.json'],
              message: RELATIVE_IMPORT_MESSAGE,
            },
          ],
        },
      ],
    },
  },

  {
    files: ['src/server/index.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  {
    files: ['**/constants.ts', '**/schema.ts', '**/types/index.ts'],
    rules: {
      'no-magic-numbers': 'off',
    },
  },

  {
    files: ['tests/**/*.ts'],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      'no-magic-numbers': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  }
);
