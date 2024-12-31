const userModel = require('../models/user.model');
const { validationResult } = require('express-validator');
const userService = require('../services/user.service');

module.exports.registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    
    const { fullname, email, password } = req.body;
    const { firstname, lastname } = fullname;
    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser(firstname, lastname, hashedPassword, email);

    const token = user.generateAuthToken();
    res.status(201).json({ token, user });
}