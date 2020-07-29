let mongoose = require('mongoose');
let express = require('express');
global.validation = require('../validation');

let router = express.Router();
exports.router = router;


global.VALIDATION_SUCCESS = {
  success: true,
}
mongoose.Error.ValidationError.prototype.json = function() {
  return {
    success: false,
    error: this._message,
    paths: Object.fromEntries(Object.values(this.errors).map(o => [o.path, o.properties.message])),
  }
}

exports.validate = async function(modelname, obj, scope=[]) {
  if (scope.length == 0) {
    scope = undefined;
  }
  let modelnames = mongoose.modelNames();
  modelname = modelname.toLowerCase();
  modelname = modelnames.find(o => o.toLowerCase() == modelname);
  try {
    let model = mongoose.model(modelname);
    if (!model) {
      return {
        success: false,
        error: `The model '${modelname}' does not exist.`,
      }
    } else {
      try {
        await model.validate(obj, scope);
        return VALIDATION_SUCCESS;
      } catch(e) {
        return e.json();
      }

    }
  } catch(e) {
    console.log(e);
    return {
      success: false,
      error: `An error has occured`,
    }
  }
}

router.get('/status', (req, res) => res.send('OK'));

router.post('/validate/:model', async (req, res) => {
  try {
    res.json(await exports.validate(
      req.params.model,
      JSON.parse(req.rawbody),
      (req.query.paths) ? req.query.paths.split(',') : []
    ))
  } catch(e) {
    console.log(e);
    res.status(500).json({
      result: false,
      msg: 'An error occured',
    })
  }
})


exports.User = require('./user/model.js');

let User = require('./user/model.js');
//console.log(User.schema);

User.validate({
  //email: "test123@gmail.com",
  name: {
    first: "ya",
    last: "boi",
  },
  password: "hi there",
}).then(res => {
  console.log(VALIDATION_SUCCESS)
})
.catch(err => {
  //console.log(err.errors);
  //console.log(err._message);
  console.log(err.json());
});

(async() => {
  console.log(await exports.validate('user', {
    email: 'test123@gmail.com',
    password: 'yes',
  }, ["email","password"]));
  console.log(await exports.validate('User', {
    email: 'test123@gmail.com',
    password: 'yes',
  }, ["email","password","name.first"]));
})();


/*let a = new User({
  email: "test123@gmail.com",
  name: {
    first: "ya",
    last: "boi",
  },
  password: "hi there",
})

//console.log(User.schema)

//console.log(a.validateSync())

//console.log()

console.log(a);
a.login("hi there").then(res => {
  console.log(res);
})*/
