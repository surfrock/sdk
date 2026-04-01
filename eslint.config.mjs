// @ts-check

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
    // {
    //     ignores: [
    //         '**/*.spec.ts'
    //     ]
    // },
    eslint.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    {
        rules: {
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    'argsIgnorePattern': '^_', // 引数が _ で始まれば無視
                    // 'varsIgnorePattern: '^_', // ローカル変数が _ で始まれば無視
                    // 'caughtErrorsIgnorePattern: '^_' // catch(e) の e が _ で始まれば無視
                }
            ],
        }
    }
);