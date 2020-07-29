let express = require('express');
let app = express();

app.use('/api', require('./api').router);

app.listen(8080);
