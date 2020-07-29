require('./utility.js')
let express = require('express');
let app = express();

let static = express.Router();
app.use(static);

// Analytics
let analytics = require('./analytics')
exports.analytics = analytics
app.use(analytics.router) // Primarily to intercept all requests for logging

let session = require('express-session');
app.use(session({
  secret: 'khe session',
  cookie: {
    maxAge: 30 * DAY,
  },
  resave: true,
  saveUninitialized: true,
}))

app.use((req, res, next) => {
  //console.log(req.session);
  next();
})

app.use('/api', require('./api').router);

app.get('/views', (req, res, next) => {
  req.session.views = (req.session.views) ? req.session.views + 1 : 1;
  req.url = '/session';
  next();
})

app.use('/session', (req, res) => res.json(
  Object.fromEntries(
    Object.entries(req.session).filter(
      o => o[0] != 'cookie'
    )
  )
))

app.get('/hmm/:what/:ok', (req, res) => res.send('yes'));

app.listen(5080);
