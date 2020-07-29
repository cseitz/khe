
module.exports = {
  email(str) {
    return (/\S+@\S+\.\S+/).test(str)
  },

}
