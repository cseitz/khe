let express = require('express');
let router = express.Router();

router.get('/', (req, res) => res.send('Kent Hack Enough - API'))

router.use('/db', require('../db').router);



exports.router = router;
