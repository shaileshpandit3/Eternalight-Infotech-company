const mongoose = require('mongoose');

//Mandatory field validation function
const isValid = (value) => {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'number' && value.toString().trim().length === 0) return false
    return true;
}

//Empty request body validation function
const isValidRequestBody = (requestBody) => {
    if (Object.keys(requestBody).length) return true
    return false;
}

//ObjectId validation
const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

module.exports = { isValid, isValidRequestBody ,isValidObjectId};