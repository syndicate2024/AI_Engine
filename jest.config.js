module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    setupFilesAfterEnv: ['<rootDir>/tests/__setup__/test-env.ts']
}; 