module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
      '^@user/(.*)$': '<rootDir>/src/user/$1',
      '^@user$': '<rootDir>/src/user',
      
      '^@auth/(.*)$': '<rootDir>/src/auth/$1',
      '^@auth$': '<rootDir>/src/auth',
      
      '^@card/(.*)$': '<rootDir>/src/card/$1',
      '^@card$': '<rootDir>/src/card',
      
      '^@guards/(.*)$': '<rootDir>/src/guards/$1',
      '^@guards$': '<rootDir>/src/guards',
      
      '^@decorators/(.*)$': '<rootDir>/src/auth/decorators/$1',
      '^@decorators$': '<rootDir>/src/auth/decorators',

      '^src/(.*)$': '<rootDir>/src/$1'
    },
    moduleFileExtensions: ['ts', 'js', 'json'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
  };
  