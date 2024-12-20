const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const BlacklistedTokenModel = require('../models/blackListToken.model');
const jwt = require('jsonwebtoken');
module.exports.registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { fullname, email, password } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "user with email already exists" });
    }

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword
    });

    const token = user.generateAuthToken();
    res.status(201).json({ token, user });
}

module.exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);


    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();
    res.cookie('token', token, {
        httpOnly: true, // Makes it inaccessible to JavaScript
        secure: process.env.NODE_ENV === 'production', // True in production (HTTPS)
        sameSite: 'None', // For cross-origin requests
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ token, user });

}

module.exports.getUserProfile = async (req, res, next) => {
    return res.status(200).json(req.user);
}

module.exports.logoutUser = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        // Decode the token to get its expiration time
        const decoded = jwt.decode(token);
        console.log(decoded);

        // Add token to the blacklist
        await BlacklistedTokenModel.create({
            token
        });

        // Clear the token from cookies (if applicable)
        res.clearCookie('token');

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to log out' });
    }
}