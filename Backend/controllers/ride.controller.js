const rideModel = require('../models/ride.model');
const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');


module.exports.createRide = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const { pickup, destination, vehicleType } = req.body;

    try{
        const ride = await rideService.createRide(pickup, destination, req.user._id, vehicleType);
        return res.status(201).json(ride);
    }catch(err){
        return res.status(400).json({ message: err.message });
    }
}

module.exports.getFare = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const { pickup, destination } = req.body;

    try{
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    }catch(err){
        return res.status(400).json({ message: err.message });
    }
}