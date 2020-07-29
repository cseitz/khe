let autocannon = require('autocannon');
require(__dirname + '/../index.js');

autocannon({
  url: 'http://localhost:5080/metrics/all',
  connections: 10,
  pipelining: 1,
  duration: 10,

}, console.log);
