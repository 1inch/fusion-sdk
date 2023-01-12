module.exports = {
    root: true,
    env: {
        node: true
    },
    ignorePatterns: ['*.mock.ts'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'unused-imports'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
    ],
    rules: {
        '@typescript-eslint/member-ordering': 'error',
        'lines-between-class-members': 'error',
        'padding-line-between-statements': [
            'error',
            {blankLine: 'always', prev: '*', next: 'return'},
            {blankLine: 'always', prev: '*', next: 'if'},
            {blankLine: 'always', prev: 'if', next: '*'},
            {blankLine: 'always', prev: 'for', next: '*'},
            {blankLine: 'always', prev: '*', next: 'for'}
        ],
        '@typescript-eslint/adjacent-overload-signatures': 'off',
        'no-unused-vars': 'off',
        'no-prototype-builtins': 'off',
        'max-len': ['error', {code: 160, ignoreComments: true}],
        'max-depth': ['error', 3],
        'max-lines-per-function': ['error', 255],
        'max-params': ['error', 10],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {argsIgnorePattern: '^_'}
        ],
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': 0,
        'no-async-promise-executor': 0,
        'no-console': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error'
    },
    overrides: [
        {
            files: ['src/**/*.spec.ts'],
            rules: {
                'max-lines-per-function': ['error', 400],
                'max-len': ['error', {code: 1130}]
            }
        }
    ]
}
