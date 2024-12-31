const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = () => {
    mongoose.connect(process.env.DB_CONNECTION_STRING).then(() => {
        console.log('Connected to the database');
    }).catch((err) => {
        console.log(err);
    });
}

module.exports = connectDB;