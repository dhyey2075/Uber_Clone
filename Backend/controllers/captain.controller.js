const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const { validationResult } = require('express-validator');

module.exports.registerCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const isCaptain = await captainModel.findOne({ email: req.body.email });
    if (isCaptain) {
        return res.status(400).json({ message: 'Captain already exists' });
    }

    try {
        const { fullname, email, password, vehicle } = req.body;
        const { firstname, lastname } = fullname;
        const { color, plate, capacity, vehicleType } = vehicle;
        const hashedPassword = await captainModel.hashPassword(password);

        const captain = await captainService.createCaptain(firstname, lastname, hashedPassword, email, color, plate, capacity, vehicleType);

        const token = captain.generateAuthToken();
        res.status(201).json({ token, captain });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}