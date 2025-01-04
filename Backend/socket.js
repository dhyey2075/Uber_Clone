// ...existing code...
const socketIO = require('socket.io');
const userModel = require('./models/user.model');

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
        const { userId } = data;
        const user = await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        console.log(user);
        
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

module.exports = { initializeSocket, sendMessage };