
module.exports = {
  // collectCoverage: true,
  // coveragePathIgnorePatterns: [
  //   "./*.config.js"
  // ],
  // collectCoverageFrom: [
  //   "*.svelte"
  // ],
  moduleFileExtensions: ['js', 'svelte'],
  "moduleNameMapper": {
    "^.+\\.css$": "identity-obj-proxy"
  },
  "transform": {
    "^.+\\.js$": "babel-jest",
    "^.+\\.svelte$": "svelte-jester"
  },
  setupFilesAfterEnv: [
    "@testing-library/jest-dom/extend-expect"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/build/",
    "/old/",
    "/public/"
  ],
  verbose: true,
  bail: false
}