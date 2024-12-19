const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const rideController = require('../controllers/ride.controller')
const authMiddleWare = require('../middlewares/auth.middleware')

router.post('/create', [

    body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn(['auto', 'car', 'motorcycle']).withMessage('Invalid vehicle type')
],
    authMiddleWare.authUser,
    rideController.createRide);


module.exports = router
