import { defineConfig } from 'eslint-define-config';
import pluginReact from 'eslint-plugin-react';
import pluginReactRecommended from 'eslint-plugin-react/configs/recommended.js';

export default defineConfig([
  pluginReactRecommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    settings: {
      react: {
        version: '18.2',
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // Aquí puedes agregar reglas personalizadas
    },
  },
]);
