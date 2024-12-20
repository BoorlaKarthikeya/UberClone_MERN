const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const { validationResult } = require('express-validator');
const flatted = require('flatted');
const jwt = require('jsonwebtoken');
const BlacklistedTokenModel = require('../models/blackListToken.model');

module.exports.registerCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const existingCaptain = await captainModel.findOne({ email });
    if (existingCaptain) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await captainModel.hashPassword(password);




    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    const token = captain.generateAuthToken();
    res.status(201).json({ token, captain });
}


module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const captain = await captainModel.findOne({ email });
    if (!captain) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const isValidPassword = await captain.comparePassword(password);
    if (!isValidPassword) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = captain.generateAuthToken();
    res.cookie('token', token, {
        httpOnly: true, // Makes it inaccessible to JavaScript
        secure: process.env.NODE_ENV === 'production', // True in production (HTTPS)
        sameSite: 'None', // For cross-origin requests
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.status(200).json({ token, captain });
}

module.exports.getCaptainProfile = async (req, res, next) => {
    return res.status(200).json(req.captain);
}

module.exports.logoutCaptain = async (req, res, next) => {
    // console.log(flatted.stringify(req));
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    try {
        // Decode the token to get its expiration time
        const decoded = jwt.decode(token);
        // console.log(decoded);

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

