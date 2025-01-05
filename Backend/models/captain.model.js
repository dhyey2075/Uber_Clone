const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname: {
        firstname:{
            type: String,
            required: true,
            min:[3, 'Firstname is too short'],
        },
        lastname:{
            type: String,
            min:[3, 'Lastname is too short'],
        },
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        select: false,
    },
    socketId:{
        type: String,
    },
    status:{
        type: String,
        enum: ['active', 'inactive', 'busy'],
        default: 'inactive',
    },
    vehicle:{
        color:{
            type: String,
            required: true,
            min:[3, 'Color is too short'],
        },
        plate:{
            type: String,
            required: true,
        },
        capacity:{
            type: Number,
            required: true,
            min:[1, 'Capacity is too low'],
        },
        vehicleType:{
            type: String,
            required: true,
            enum: ['car', 'motorcycle', 'auto'],
        },
    },
    location: {
        lat:{
            type: Number,
        },
        lng:{
            type: Number,
        },
    },
})

captainSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id}, process.env.JWT_SECRET, {expiresIn: '24h'});
    return token;
}

captainSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

captainSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
}


const captainModel = mongoose.model('Captain', captainSchema);

module.exports = captainModel;