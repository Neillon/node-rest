const mongoose = require('../database')
const bcrypt = require('bcrypt')

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true, 
        unique: true
    },
    password: {
        type: String,
        require: true,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

UserSchema.pre('save', function(next) {
    const hash = bcrypt.hash(this.password, 10);
    this.password = hash;

    next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User;