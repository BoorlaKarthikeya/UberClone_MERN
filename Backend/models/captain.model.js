const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const captainSchema = new mongoose.Schema({
    fullname: {
        firstname: {
            type: String,
            required: true,
            minLength: [3, 'Firstname must be atleast 3 characters'],
        },
        lastname: {
            type: String,
            minLength: [3, 'lastname must be atleast 3 characters long'],
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: true,
        minLength: [8, 'Password must be atleast 8 characters long'],
    },
    socketId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },
    vehicle: {
        color: {
            type: String,
            required: true,
            minLength: [3, 'Password must be atleast 8 characters long'],
        },
        plate: {
            type: String,
            required: true,
            minLength: [3, 'Password must be atleast 8 characters long'],
        },
        capacity: {
            type: Number,
            required: true,
            min: [1, 'Password must be atleast 8 characters long'],
        },
        vehicleType: {
            type: String,
            required: true,
            enum: ['car', 'motorcycle', 'auto'],
        },

    },
    location: {
        ltd: {
            type: Number,
        },
        lng: {
            type: Number,
        }
    }
});

captainSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET_KEY, { expiresIn: '24h' });
    return token;
}

captainSchema.methods.comparePassword = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
}

captainSchema.statics.hashPassword = async function (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}

const captainModel = mongoose.model('captain', captainSchema);

module.exports = captainModel;