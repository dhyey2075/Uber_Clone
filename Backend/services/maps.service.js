const dotenv = require('dotenv');
dotenv.config();
const captainModel = require('../models/captain.model');

module.exports.getAddressCoordinated = async (address) => {
    const res = await fetch(`
https://api.olamaps.io/places/v1/geocode?address=${address}&language=English&api_key=${process.env.OLA_API_KEY}`)
    return res
}

module.exports.getAutoCompleteHelper = async (input, location) => {
    const res = await fetch(`https://api.olamaps.io/places/v1/autocomplete?input=${input}&api_key=${process.env.OLA_API_KEY}`)
    return res
}

module.exports.getDistanceHelper = async (slat, slong, elat, elong) => {
    const res = await fetch(`https://api.olamaps.io/routing/v1/directions/basic?origin=${slat}%2C${slong}&destination=${elat}%2C${elong}&alternatives=false&steps=false&overview=full&language=en&api_key=${process.env.OLA_API_KEY}`, {
        method: "POST"
    })      
    return res;
}

module.exports.getCaptainsInTheRadius = async (lat, lng, radius) => {

    // radius in km


    const captains = await captainModel.find({
        status: 'active',
        location: {
            $geoWithin: {
                $centerSphere: [ [ lat, lng ], radius / 6371 ]
            }
        }
    });

    return captains;
}

module.exports.getReverseGeocodeHelper = async (lat, long) => {
    const res = await fetch(`https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat},${long}&language=English&api_key=${process.env.OLA_API_KEY}`)
    return res;
}