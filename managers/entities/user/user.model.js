const mongoose = require('mongoose');

const userSchema = require('./user.schema');

module.exports = mongoose.model('User', userSchema);