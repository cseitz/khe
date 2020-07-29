const express = require('express')
const chalk = require('chalk')
const stream = require('stream')
const fs = require('fs')
let router = express.Router()

exports.router = router;

let metrics;
let _metrics = () => { metrics = {
  timestamp: new Date().getTime(),
  errors: 0,
  warnings: 0,
  connections: 0,
  times: {
    max: 0,
    min: 0,
    avg: 0,
    _count: 0,
    _total: 0,
  },
  events: [],
}; return metrics; };
_metrics();
metrics.events.push('start');

let metricsPath = __dirname + '/metrics.json';
let metricsArray = [];

let maxHistory = 1 * HOUR;
let metricsInterval = 20 * SECOND;
let metricsPacket = function() {
  return {
    data: metricsArray,
    updated: new Date().getTime(),
    interval: metricsInterval,
    count: metricsArray.length,

  }
}
let refreshMetrics = function() {
  let now = new Date().getTime();
  metrics.duration = (now - metrics.timestamp);
  metricsArray.push(metrics);
  _metrics();
  metricsArray = metricsArray.filter(o => (now - o.timestamp) <= maxHistory);
  fs.writeFileSync(metricsPath, JSON.stringify(metricsPacket()))
}

try {
  metricsArray = require(metricsPath).data;
} catch(e) {
  metricsArray = [];
} finally {
  refreshMetrics();
}

setInterval(refreshMetrics, metricsInterval);

let closestMetric = function(timestamp=-1) {
  if (timestamp == -1) {
    return metricsArray.slice(-1)
  } else {
    let stuff = Object.create(metricsArray);
    let dist = -1;
    let tries = 0;
    while (stuff.length >= 2 && (tries++) <= 20) {
      stuff = stuff.filter(o => {
        let dst = Math.abs(timestamp - o.timestamp);
        if (dst <= dist || dist == -1) {
          dist = dst;
          return true;
        }
        return false;
      })
    }
    if (stuff.length == 1) {
      return stuff[0];
    } else {
      return false;
    }
  }
}

router.get('/metrics/:quantity', (req, res) => {
  console.log(req.params);
  let quantity = req.params.quantity+0;
  if (quantity == 'all') {
    res.json(metricsArray);
  } else if (quantity == 'now') {
    res.json(metrics);
  } else if (quantity.length <= 100 && Number(quantity) != NaN) {
    let num = Number(quantity);
    res.json(metricsArray.slice(-num))
  } else {
    if (quantity.indexOf('now-') >= 0) {
      quantity = new Date().getTime() - Number(quantity.substr(4));
    }
    res.json(closestMetric(req.params.quantity));
  }
})
router.get('/metrics', (req, res) => {
  res.json(metrics)
})
router.get('/metrics-pretty', (req, res) => {
  res.send(`<pre>${
    require('util').inspect(metrics)
  }</pre>`);
})

// Analytics
/*
    Used to intercept everything to KHE so we can analyze it for
  performance, activity, errors, and more. This module hooks on to
  already existing functionality to expand it. This is not needed
  to run KHE, but it's data collection will always be helpful.
*/

let responseTime = require('response-time')
router.use((req, res, next) => {
  metrics.connections++;
  next();
})
router.use(responseTime((req, res, time) => {
  // After request finishes
  //console.log(res)
  if (time > metrics.times.max) {
    metrics.times.max = time;
  } else if (time < metrics.times.min || metrics.times.min == 0) {
    metrics.times.min = time;
  }
  metrics.times._count++;
  metrics.times._total += time;
  metrics.times.avg = metrics.times._total / metrics.times._count;
  let highlight = chalk.magenta;
  let params = Object.values(req.params || {});
  let code = res.statusCode;
  let [url, queries] = req.originalUrl.split('?');
  url = url.split('/').map(o => {
    return params.indexOf(o) >= 0 ? highlight(o) : o
  }).join('/') + (queries ? chalk.yellow('?' + queries) : '');
  console.log(code, req.method, url, chalk[
    code == 200 || code == 304 ?
    'green' : (
      code == 404 ? 'yellow' : (
        'red'
      )
    )
  ]('→'), chalk[
    time < 2 ? 'green' :
    time < 5 ? 'yellow' :
    'red'
  ](time.toFixed(2) + " ms"))
}))
