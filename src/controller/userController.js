const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { isValid, isValidRequestBody, isValidObjectId } = require('../utils/validator');
const saltRounds = 10;
const emailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;

// user registration 
const userRegistration = async (req, res) => {
    try {
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide User details" })
        }

        //Destructuring the request body
        const { name, email, password } = requestBody;

        // Basic user validations

        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: "name is required" });
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" });
        }

        //email valid syntax validation
        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: false, message: "Email should be a valid email" });
        }
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
            return res.status(400).send({ status: false, message: "Email already registered" });
        }
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' });
        }

        // Password validation like upperCase, lowerCase , minLength, maxLength, Special character
        if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(password))) {
            return res.status(400).send({ status: false, message: 'password should be valid password' });
        }

        //hashing password using bcrypt
        const hashPassword = bcrypt.hashSync(password, saltRounds);

        //create a object 
        const userData = {
            name: name, email: email, password: hashPassword
        };
        const userCreated = await userModel.create(userData);
        return res.status(201).send({ status: true, message: 'User created successfully', data: userCreated });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

//User login
const userLogin = async (req, res) => {
    try {
        // Basic user validation
        const requestBody = req.body;
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide User details" })
        }
        const { email, password } = requestBody;
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).send({ status: false, message: "Email should be a valid email" });
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: 'password is required' });
        }

        // fetching user data using email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).send({ status: false, message: "User doesn't exists. Please register first" });
        }

        // comparing password of DB and getting from user
        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            return res.status(401).send({ status: false, message: "Password not matched" });
        }

        // Creating jwt token and save it on cookie
        const token = jwt.sign({
            userId: user._id
        }, 'abc123', { expiresIn: '1h' });
        res.cookie(`accessToken`, token);

        return res.status(200).send({ status: true, message: "Success" });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const userProfile = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: 'Only Object Id allowed !' });
        }

        //Authorization
        if (req.user != userId) {
            return res.status(403).send({ status: false, message: "You are not authorized" })
        }
        const userDetails = await userModel.findById(userId).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });

        return res.status(200).send({ status: true, message: 'User Profile', data: userDetails });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }

}


const userUpdate = async (req, res) => {
    try {
        const userId = req.params.userId;
        const requestBody = req.body;
        const { name, password, newPassword } = requestBody;

        // Basic user validation
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters. Please provide User details" })
        }
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: 'Only Object Id allowed !' });
        }

        //Authorization
        if (req.user != userId) {
            return res.status(403).send({ status: false, message: "You are not authorized" })
        }

        const updateData = {};

        //Updating  each details 
        if ("name" in requestBody) {
            if (!isValid(name)) {
                return res.status(400).send({ status: false, message: "name is required" });
            }

            if (!('$set' in updateData)) {
                updateData["$set"] = {}
            }
            updateData["$set"]["name"] = name;
        }

        //Updating  each details 
        if ("password" in requestBody) {
            if (!isValid(password)) {
                return res.status(400).send({ status: false, message: "password is required" });
            }
            if (!isValid(newPassword)) {
                return res.status(400).send({ status: false, message: 'newPassword is required' });
            }

            const user = await userModel.findById({ _id: userId });
            // comparing password of DB and getting from user
            const isMatched = await bcrypt.compare(password, user.password);
            if (!isMatched) {
                return res.status(400).send({ status: false, message: "Password not matched" });
            }

            // Password validation like upperCase, lowerCase , minLength, maxLength, Special character
            if (!(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/.test(newPassword))) {
                return res.status(400).send({ status: false, message: 'newPassword should be valid password' });
            }

            //hashing password using bcrypt
            const hashPassword = bcrypt.hashSync(newPassword, saltRounds);

            if (!('$set' in updateData)) {
                updateData["$set"] = {}
            }
            updateData["$set"]["password"] = hashPassword;
        }

        const updatedDetails = await userModel.findByIdAndUpdate({ _id: userId }, updateData);
        return res.status(200).send({ status: true, message: "UserDetails updated successfully" });

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//User logout using deleting cookies
const userLogout = async (req, res) => {
    try {
        // Delete the token saved in cookie
        res.clearCookie('accessToken')
        return res.status(200).send({ status: true, message: 'User logout successfully' });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

module.exports = { userRegistration, userLogin, userProfile, userUpdate, userLogout };