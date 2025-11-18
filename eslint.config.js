// ESLint configuration for Luminari's Quest
// Cross-references: .bolt/prompt (code generation standards), .cursor/rules/ (IDE guidelines), 
// CONTRIBUTING.md (code quality standards), tsconfig.*.json (TypeScript settings)

import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'

export default [
  {
    ignores: ['dist', 'node_modules', '.bolt'],
  },
  // Config for Node.js files (vite.config.ts, vitest.config.ts, etc.)
  {
    files: ['*.config.{ts,js}', 'scripts/**/*.{ts,js}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        Buffer: 'readonly',
        NodeJS: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'off', // TypeScript handles this
    },
  },
  // Main config for React/TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLTableElement: 'readonly',
        HTMLTableCaptionElement: 'readonly',
        HTMLTableCellElement: 'readonly',
        HTMLTableRowElement: 'readonly',
        HTMLTableSectionElement: 'readonly',
        HTMLHeadingElement: 'readonly',
        HTMLParagraphElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLOListElement: 'readonly',
        HTMLUListElement: 'readonly',
        HTMLLIElement: 'readonly',
        HTMLAnchorElement: 'readonly',
        HTMLAudioElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLMediaElement: 'readonly',
        KeyboardEvent: 'readonly',
        Audio: 'readonly',
        Image: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        PerformanceEntry: 'readonly',
        PerformanceObserver: 'readonly',
        PerformanceNavigationTiming: 'readonly',
        localStorage: 'readonly',
        alert: 'readonly',
        global: 'readonly',
        process: 'readonly',
        NodeJS: 'readonly',
        React: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Test globals from vitest
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      'no-unused-vars': 'off', // Let TypeScript handle this
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/prop-types': 'off', // We use TypeScript for prop validation
      'react/no-unescaped-entities': 'warn', // Downgrade to warning
      'no-useless-escape': 'error',
      'react-hooks/set-state-in-effect': 'warn', // Downgrade to warning
      'no-undef': 'off', // TypeScript handles undefined variables
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]
