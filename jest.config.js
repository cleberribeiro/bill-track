export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@libsql/client$': '<rootDir>/node_modules/@libsql/client/lib-cjs/node.js',
  },
};
