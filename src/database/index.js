
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/node-rest');

mongoose.Promise = global.Promise


module.exports = mongoose;