const express = require('express');
const router = express.Router();
const rideController = require('../controllers/ride.controller');
const AuthMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator')

router.post('/create-ride', AuthMiddleware.authUser,
    body('pickup').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({ min: 3 }).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn([ 'auto', 'car', 'motorcycle' ]).withMessage('Invalid vehicle type'),
     rideController.createRide);

router.post('/get-fare', AuthMiddleware.authUser, rideController.getFare, )


module.exports = router;