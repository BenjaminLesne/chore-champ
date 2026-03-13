import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';
// @ts-ignore -- no types for this plugin
import drizzle from 'eslint-plugin-drizzle';

export default defineConfig(
   { ignores: ['.next', 'src/generated', 'public/lib'] },
   ...nextVitals,
   prettier,
   {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: {
         drizzle,
      },
      extends: [
         ...tseslint.configs.recommended,
         ...tseslint.configs.recommendedTypeChecked,
         ...tseslint.configs.stylisticTypeChecked,
      ],
      rules: {
         '@typescript-eslint/array-type': 'off',
         '@typescript-eslint/consistent-type-definitions': 'off',
         '@typescript-eslint/consistent-type-imports': [
            'warn',
            { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
         ],
         '@typescript-eslint/no-non-null-assertion': 'error',
         '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
         '@typescript-eslint/require-await': 'off',
         '@typescript-eslint/no-misused-promises': [
            'error',
            { checksVoidReturn: { attributes: false } },
         ],
         '@typescript-eslint/no-unsafe-type-assertion': 'error',
         'drizzle/enforce-delete-with-where': [
            'error',
            { drizzleObjectName: ['db', 'ctx.db'] },
         ],
         'drizzle/enforce-update-with-where': [
            'error',
            { drizzleObjectName: ['db', 'ctx.db'] },
         ],
         'no-restricted-syntax': [
            'error',
            {
               selector: 'TSEnumDeclaration',
               message: 'Use `as const` objects instead of enums.',
            },
            {
               selector: 'VariableDeclarator[init] > Identifier > TSTypeAnnotation',
               message:
                  'Prefer inferred types over explicit annotations on variables. Use `satisfies` if you need type validation.',
            },
            {
               selector: "JSXAttribute[name.name='className'] > JSXExpressionContainer > TemplateLiteral",
               message: 'Use the `cn()` helper from `@/lib/utils` instead of template literals in className.',
            },
            {
               selector: 'TSAsExpression:not([typeAnnotation.typeName.name="const"])',
               message: 'Avoid `as` type assertions. Narrow the type upstream (e.g. fix the prop/param type) so the cast is unnecessary. Use type guards, generics, or `satisfies` as alternatives. `as const` is allowed.',
            },
            {
               selector: "CallExpression[callee.object.name='t'][callee.property.name='raw']",
               message:
                  'Avoid `t.raw()` — it returns `unknown` and bypasses type safety. Use named keys in your JSON and map them in the component: `const keys = ["a", "b"] as const; keys.map(k => t(`items.${k}`))`. See https://next-intl.dev/docs/usage/translations#arrays-of-messages',
            },
         ],
         'no-restricted-properties': [
            'error',
            {
               object: 'process',
               property: 'env',
               message: 'Use `env` from `@/env` instead of `process.env`.',
            },
         ],
      },
   },

   // ── Warn on try/catch — prefer tryCatch() utility ──
   {
      files: ['**/*.ts', '**/*.tsx'],
      ignores: ['src/lib/utils/try-catch.ts'],
      rules: {
         'no-restricted-syntax': [
            'warn',
            {
               selector: 'TryStatement',
               message:
                  'Avoid try/catch. Use `tryCatch()` from `@/lib/utils/try-catch` instead.',
            },
         ],
      },
   },
   {
      linterOptions: { reportUnusedDisableDirectives: true },
      languageOptions: {
         parserOptions: { projectService: true },
      },
   },

   // ── Architecture boundaries ──────────────────────────────────────────
   {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      plugins: { boundaries },
      settings: {
         'import/resolver': {
            typescript: {
               alwaysTryTypes: true,
            },
         },
         'boundaries/elements': [
            // Route groups
            { type: 'app-auth', pattern: ['src/app/**/\\(auth\\)/**'], mode: 'full' },
            { type: 'app-dashboard', pattern: ['src/app/**/\\(dashboard\\)/**'], mode: 'full' },
            { type: 'app-editor', pattern: ['src/app/**/\\(editor\\)/**'], mode: 'full' },
            { type: 'app-public', pattern: ['src/app/**/\\(public\\)/**'], mode: 'full' },
            { type: 'app-checkout', pattern: ['src/app/**/\\(checkout\\)/**'], mode: 'full' },
            {
               type: 'app-unsubscribe',
               pattern: ['src/app/**/\\(unsubscribe\\)/**'],
               mode: 'full',
            },
            { type: 'app-dev', pattern: ['src/app/**/\\(dev\\)/**'], mode: 'full' },
            { type: 'app-api', pattern: ['src/app/api/**'], mode: 'full' },
            // Catch-all for app root files (layout, not-found, etc.)
            { type: 'app-root', pattern: ['src/app/**'], mode: 'full' },

            // Shared layers
            { type: 'components', pattern: ['src/components/**'], mode: 'full' },
            { type: 'actions', pattern: ['src/actions/**'], mode: 'full' },
            { type: 'hooks', pattern: ['src/hooks/**'], mode: 'full' },
            { type: 'lib', pattern: ['src/lib/**'], mode: 'full' },
            { type: 'config', pattern: ['src/config/**'], mode: 'full' },
            { type: 'data', pattern: ['src/data/**'], mode: 'full' },
            { type: 'types', pattern: ['src/types/**'], mode: 'full' },
            { type: 'i18n', pattern: ['src/i18n/**'], mode: 'full' },
         ],
         'boundaries/ignore': ['src/generated/**'],
      },
      rules: {
         'boundaries/element-types': [
            'error',
            {
               default: 'disallow',
               rules: [
                  // Shared layers: importable by anyone
                  {
                     from: ['*'],
                     allow: ['lib', 'config', 'data', 'types', 'i18n'],
                  },

                  // app-* can import components, actions, hooks, and their own route group
                  {
                     from: ['app-auth'],
                     allow: ['components', 'actions', 'hooks', 'app-auth'],
                  },
                  {
                     from: ['app-dashboard'],
                     allow: ['components', 'actions', 'hooks', 'app-dashboard'],
                  },
                  {
                     from: ['app-editor'],
                     allow: ['components', 'actions', 'hooks', 'app-editor'],
                  },
                  {
                     from: ['app-public'],
                     allow: ['components', 'actions', 'hooks', 'app-public'],
                  },
                  {
                     from: ['app-checkout'],
                     allow: ['components', 'actions', 'hooks', 'app-checkout'],
                  },
                  {
                     from: ['app-unsubscribe'],
                     allow: ['components', 'actions', 'hooks', 'app-unsubscribe'],
                  },
                  {
                     from: ['app-dev'],
                     allow: ['components', 'actions', 'hooks', 'app-dev'],
                  },
                  {
                     from: ['app-api'],
                     allow: ['components', 'actions', 'hooks', 'app-api'],
                  },
                  {
                     from: ['app-root'],
                     allow: ['components', 'actions', 'hooks', 'app-root'],
                  },

                  // components can import hooks + other components
                  {
                     from: ['components'],
                     allow: ['components', 'hooks'],
                  },

                  // actions can import lib only
                  {
                     from: ['actions'],
                     allow: ['actions'],
                  },

                  // hooks can import lib + other hooks
                  {
                     from: ['hooks'],
                     allow: ['hooks'],
                  },

                  // lib can import lib
                  {
                     from: ['lib'],
                     allow: ['lib'],
                  },
               ],
            },
         ],
      },
   },

   // ── Allow process.env in env.ts and middleware (edge runtime can't use @/env) ──
   {
      files: ['src/env.ts', 'src/proxy.ts', 'prisma.config.ts'],
      rules: { 'no-restricted-properties': 'off' },
   },

   // ── Block server-only imports in client-side code ────────────────────
   {
      files: ['src/components/**/*.ts', 'src/components/**/*.tsx', 'src/hooks/**/*.ts'],
      rules: {
         'no-restricted-imports': [
            'error',
            {
               paths: [
                  { name: '@/lib/prisma', message: 'Server-only module. Use a server action.' },
                  {
                     name: '@/lib/auth/server',
                     message: 'Server-only module. Use a server action.',
                  },
                  {
                     name: '@/lib/email/send',
                     message: 'Server-only module. Use a server action.',
                  },
                  { name: '@prisma/client', message: 'Server-only module. Use a server action.' },
               ],
            },
         ],
      },
   },

   // ── Known boundary exceptions ────────────────────────────────────────
   {
      files: ['src/components/auth/auth-dialog.tsx'],
      rules: { 'boundaries/element-types': 'off' },
   },
   {
      files: [
         'src/components/pdf-editor/action-buttons.tsx',
         'src/components/pdf-editor/lock-modal.tsx',
      ],
      rules: { 'boundaries/element-types': 'off' },
   },
   {
      files: ['src/lib/file-preview/file-types.ts'],
      rules: { 'boundaries/element-types': 'off' },
   },
   {
      files: ['src/app/**/\\(dev\\)/layout.tsx'],
      rules: { 'boundaries/element-types': 'off' },
   },
   {
      files: ['src/hooks/use-upload.ts'],
      rules: { 'boundaries/element-types': 'off' },
   },
   {
      files: ['src/app/**/\\(dashboard\\)/**/dashboard-w9-hero.tsx'],
      rules: { 'boundaries/element-types': 'off' },
   },
);
