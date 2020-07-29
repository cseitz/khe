const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const controller = require('./controller.js')

let Model = new Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email address is required'],
    validate: {
      validator: validation.email,
      message: props => `${props.value} is not a valid email address!`
    }
  },
  name: {
    first: {type: String, required: true},
    last: {type: String, required: true},
  },
  created: {type: Date, default: Date.now},
  password: {type: String, set: controller.hash},


});

if (controller.methods) {
  for (let x in controller.methods) {
    Model.methods[x] = controller.methods[x];
  }
}

module.exports = mongoose.model('User', Model);
