const rideModel = require('../models/ride.model');
const rideService = require('../services/ride.service');
const mapService = require('../services/maps.service');
const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const { validationResult } = require('express-validator');


module.exports.createRide = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const { pickup, destination, vehicleType, user } = req.body;

    const fare = await rideService.getFare(pickup, destination);
    if(!fare){
        return res.status(400).json({ message: 'Invalid pickup or destination address' });
    }
    const captains = await mapService.getCaptainsInTheRadius(fare.location.lat, fare.location.lng, 10)


    try{
        const ride = await rideService.createRide(pickup, destination, user, vehicleType);
        return res.status(201).json({ ride, captains});
    }catch(err){
        return res.status(400).json({ messagedhyey: err.message });
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

module.exports.confirmRide = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    try{
        const { ride, captainId } = req.body;
        const user = await userModel.findById(ride.user);
        const captain = await captainModel.findByIdAndUpdate(captainId, { status: 'busy' });

        const rideAcc = await rideModel.findByIdAndUpdate(ride._id, { status: 'accepted', captain: captainId });
        console.log("Acc", rideAcc);

        return res.status(200).json({ user, captain, ride: rideAcc });
    } catch(err){
        return res.status(400).json({ message: err.message });
    }

}