const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blacklisttoken.model');

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

module.exports.loginCaptain = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const captain = await captainModel.findOne({ email }).select("+password");

    if (!captain) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await captain.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = captain.generateAuthToken();
    res.cookie('token', token);
    return res.status(200).json({ token, captain });
}

module.exports.getCaptainProfile = async (req, res) => {
    return res.status(200).json(req.captain);
}

module.exports.logoutCaptain = async (req, res) => {
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];
    await blackListTokenModel.create({ token: token });
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully' });
}