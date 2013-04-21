// Karma configuration
basePath = '../';

files = [
  MOCHA,
  MOCHA_ADAPTER,
  {pattern: 'test/lib/chai.js', included: true},
  {pattern: 'test/lib/jQuery.js', included: true},
  {pattern: 'lib/*.js', included: true},
  {pattern: 'test/fixtures/*', included: false},
  {pattern: 'test/lib/chai-sinon.js', included: true},
  {pattern: 'test/lib/sinon.js', included: true},
  'test/spec/*.js'
];

reporters = ['progress'];
port = 9876;
runnerPort = 9100;
colors = true;
logLevel = LOG_INFO;
captureTimeout = 60000;
singleRun = false;
