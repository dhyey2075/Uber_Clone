// ...existing code...
const socketIO = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
const rideModel = require('./models/ride.model');

let io;

function initializeSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: '*'
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    socket.on('addSocketIdToUserDb', async(data) => {
        const { userId, type } = data;
        if(type === 'user'){
            const user = await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        }
        else{
            const driver = await captainModel.findByIdAndUpdate(userId, { socketId: socket.id, status: 'active' });
        }
        
    })

    socket.on('removeSocketIdFromUserDb', async(data) => {
        const { userId, type } = data;
        if(type === 'user'){
            const user = await userModel.findByIdAndUpdate(userId, { socketId: null });
        }
        else{
            const driver = await captainModel.findByIdAndUpdate(userId, { socketId: null, status: 'inactive' });
        }
    })

    socket.on('update-location-captain', async(data) => {
        const { userId, location } = data
        if(!location || !location.lat || !location.lng){
            return socket.emit('error', {message: 'Invalid Location Data.'})
        }

        await captainModel.findByIdAndUpdate(userId, { location: {
            lat: location.lat,
            lng: location.lng,
        } });
    })

    socket.on('rideRequest', (data) => {
        const { captainSocketId, ride } = data;
        console.log('Ride Request', data);
        data.ride.otp="";
        io.to(captainSocketId).emit('rideRequestToCaptain', { ride });
    })

    socket.on('rideAccepted', (data) => {
        const { userSocketId, ride, captain } = data;
        console.log('Ride Accepted', data);
        console.log(userSocketId);
        io.to(userSocketId).emit('rideAcceptedToUser', { ride, captain });
    })

    socket.on('otp-verify', async(data) => {
        const { rideId, otp, socketId } = data;
        const ride = await rideModel.findById(rideId).select('otp');
        console.log(socketId)
        if(otp == ride.otp){
            const updatedRide = await rideModel.findByIdAndUpdate(rideId, { status: 'ongoing' });
            socket.emit('otp-verify-response', { message: 'OTP Verified', ride: updatedRide });
            io.to(socketId).emit('otp-verify-response', { message: 'OTP Verified', ride: updatedRide });
        }
        else{
            socket.emit('otp-verify-response', { message: 'Invalid OTP' });
            io.to(userId).emit('otp-verify-response', { message: 'Invalid OTP' });
        }
    })

    socket.on('rideRequestCancel', async(data) => {
        const { ride, captain } = data;
        console.log("Cancel request to", captain.socketId);
        io.to(captain.socketId).emit('rideRequestCancelToCaptain', { ride });
    })

    socket.on('end-ride', async(data) => {
        const { rideId, userSocketId, captainId } = data;
        const updatedRide = await rideModel.findByIdAndUpdate(rideId, { status: 'completed' });
        const updatedCaptain = await captainModel.findByIdAndUpdate(captainId, { status: 'active' });
        console.log('End Ride', userSocketId);
        io.to(userSocketId).emit('end-ride-to-user', { ride: updatedRide });
    })

    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id);
    });
  });
}

function sendMessage(event, data) {
  if (!io) {
    console.warn('Socket not initialized');
    return;
  }
  io.emit(event, data);
}

function sendMessageToSocketId(socketId, message, event){
    if(io){
        io.to(socketId).emit(event, message)
    } else {
        console.log('Socket.io is not initialized')
    }
}

module.exports = { initializeSocket, sendMessage, sendMessageToSocketId };