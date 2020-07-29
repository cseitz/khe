const bcrypt = require('bcrypt');

exports.hash = function(password) {
  return bcrypt.hashSync(password, 10);
}

exports.methods = {
  async login(password) {
    return await bcrypt.compare(password, this.password);
  },
}
