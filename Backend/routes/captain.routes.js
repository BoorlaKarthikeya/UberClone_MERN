const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const captainController = require('../controllers/captain.controller');

router.post('/register', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('fullname.firstname').isLength({ min: 3 }).withMessage('firstname must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be atleast 6 characters long'),
    body('vehicle.color').isLength({ min: 3 }).withMessage('vehicle color must be atleast 3 characters'),
    body('vehicle.plate').isLength({ min: 3 }).withMessage('plate number must be atleast 3 characters'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('vehicle capacity at least 1 '),
    body('vehicle.vehicleType').isIn(['car', 'motorcycle', 'auto']).withMessage('vehicle type must be atleast 3 characters'),
],
    captainController.registerCaptain
)

module.exports = router;