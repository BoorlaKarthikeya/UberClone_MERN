const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.authUser = async (req, res, next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const isBlackListed = await userModel.findOne({ token: token });
    if (isBlackListed) {
        return res.status(401).json({ message: 'unAuthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
        const user = await userModel.findById(decoded._id);
        req.user = user;
        return next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Failed to authenticate token' });
    }

}