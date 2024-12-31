const userModel = require('../models/user.model');

module.exports.createUser = async (firstname, lastname, password, email) => {
    console.log(firstname, lastname, password, email);
    
    if(!firstname || !password || !email) {
        throw new Error('All fields are required');
    }
    const user = new userModel({
        fullname: {
            firstname,
            lastname,
        },
        email,
        password,
    });
    return user.save();
}