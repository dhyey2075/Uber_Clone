const { log } = require('console');
const rideModel = require('../models/ride.model');
const mapService = require('./maps.service');
const crypto = require('crypto')

async function getFare(pickup, destination) {

    if (!pickup || !destination) {
        throw new Error('Pickup and destination are required');
    }

    let res = await fetch(`https://api.olamaps.io/places/v1/geocode?address=${pickup}%20College&language=English&api_key=${process.env.OLA_API_KEY}`)
    let data = await res.json();
    
    let pickupcoords = data.geocodingResults[0].geometry.location


    res = await fetch(`https://api.olamaps.io/places/v1/geocode?address=${destination}%20College&language=English&api_key=${process.env.OLA_API_KEY}`)
    data = await res.json()
    let destcoords = data.geocodingResults[0].geometry.location


    const distanceTimeres = await fetch(`${process.env.API_URL}/maps/getDistance?slat=${pickupcoords.lat}&slong=${pickupcoords.lng}&elat=${destcoords.lat}&elong=${destcoords.lng}`)
    const distanceTime = await distanceTimeres.json();


    console.log(distanceTime);
    

    const baseFare = {
        auto: 30,
        car: 50,
        motorcycle: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        motorcycle: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        motorcycle: 1.5
    };



    const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance / 1000) * perKmRate.auto) + ((distanceTime.duration/ 60) * perMinuteRate.auto)),
        car: Math.round(baseFare.car + ((distanceTime.distance / 1000) * perKmRate.car) + ((distanceTime.duration / 60) * perMinuteRate.car)),
        motorcycle: Math.round(baseFare.motorcycle + ((distanceTime.distance / 1000) * perKmRate.motorcycle) + ((distanceTime.duration / 60) * perMinuteRate.motorcycle))
    };
    fare.time = distanceTime.readable_duration;
    fare.distance = distanceTime.readable_distance;
    fare.location = {
        lat: pickupcoords.lat,
        lng: pickupcoords.lng
    }
    console.log(fare);
    
    return fare;


}

module.exports.getFare = getFare;

function getOtp(num) {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}

module.exports.createRide = async(pickup, destination, user, vehicleType) => {
    if(!pickup || !destination || !user) {
        throw new Error('All fields are required');
    }
    const fare = await getFare(pickup, destination);
    const otp = getOtp(4);
    const ride = new rideModel({
        user,
        pickup,
        destination,
        type: vehicleType,
        fare: fare[vehicleType],
        otp,
    })

    return ride.save()
    
}