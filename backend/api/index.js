let express = require('express');
let router = express.Router();

router.get('/', (req, res) => res.send('Kent Hack Enough - API'))

exports.router = router;
