const captainModel = require('../models/captain.model');
const { validationResult } = require('express-validator');

module.exports.createCaptain = async (
    firstname, lastname, password, email, color, plate, capacity, vehicleType
) => {
   if(!firstname || !password || !email || !color || !plate || !capacity || !vehicleType) {
       throw new Error('All fields are required');
   }
    const captain = new captainModel({
         fullname: {
              firstname,
              lastname,
         },
         email,
         password,
         vehicle: {
              color,
              plate,
              capacity,
              vehicleType,
         },
    });
    return captain.save();
}