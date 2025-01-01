const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const bcrypt = require('bcrypt');
const blackListTokenModel = require('../models/blacklisttoken.model');
const jwt = require('jsonwebtoken');    

module.exports.authUser = async (req, res, next) => {    
    try{
        const token= req.cookies.token || req.headers.authorization.split(' ')[1]; 
        if(!token){
            
            return res.status(401).json({ message: 'Unauthorized' });
        }
        else{
            const isBlackListed = await blackListTokenModel.findOne({ token: token });
            
            if(isBlackListed){
                
                return res.status(401).json({ message: 'Unauthorized' });
            }
        }
    }catch(err){
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try{
        const token= req.cookies.token || req.headers.authorization.split(' ')[1]; 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);
        req.user = user;
        return next();
    }
    catch(err){
        console.log(err);
        
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports.authCaptain = async (req, res, next) => {
    try{
        const token= req.cookies.token || req.headers.authorization.split(' ')[1]; 
        if(!token){
            console.log('no token');
            
            return res.status(401).json({ message: 'Unauthorized' });
        }
        else{
            const isBlackListed = await blackListTokenModel.findOne({ token: token });
            
            if(isBlackListed){
                
                return res.status(401).json({ message: 'Unauthorized' });
            }
        }
    }catch(err){
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try{
        const token= req.cookies.token || req.headers.authorization.split(' ')[1]; 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id);
        req.captain = captain;
        return next();
    }
    catch(err){
        console.log(err);
        
        return res.status(401).json({ message: 'Unauthorized' });
    }
}