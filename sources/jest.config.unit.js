module.exports = {
  "transform": {
    "^.+\\.js$": "babel-jest",
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
  "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  "collectCoverage": true,
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js"
  ],
}