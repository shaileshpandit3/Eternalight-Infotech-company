const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 8
    }

},
    { timestamps: true });
module.exports = mongoose.model('User', userSchema);