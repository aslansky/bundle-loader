// Karma configuration
basePath = '../';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  {pattern: 'test/lib/jQuery.js', included: true},
  {pattern: 'lib/*.js', included: true},
  {pattern: 'test/fixtures/*', included: false},
  {pattern: 'test/lib/jasmine-sinon.js', included: true},
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
