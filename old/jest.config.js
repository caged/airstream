
module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "testMatch": [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  setupFiles: ["jest-canvas-mock"],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
  ],
  coverageThreshold: {
    "global": {
      "branches": 75,
      "functions": 75,
      "lines": 75,
      "statements": 75
    },
  },
  globals: {
    "figmaRefs": {},
    "__html__": true
  },
}