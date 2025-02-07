// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

let waitingUser  = null;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle finding a random user
    socket.on('findRandom', () => {
        if (waitingUser ) {
            const pairedUser  = waitingUser ;
            waitingUser  = null;
            // Notify both users that they are paired
            socket.emit('paired', { id: pairedUser  });
            io.to(pairedUser ).emit('paired', { id: socket.id });
        } else {
            waitingUser  = socket.id;
            socket.emit('waiting'); // Notify the user that they are waiting
        }
    });

    // Handle signaling for WebRTC
    socket.on('signal', (data) => {
        socket.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('User  disconnected:', socket.id);
        if (waitingUser  === socket.id) {
            waitingUser  = null; // Clear waiting user if they disconnect
        }
    });
});

// Set the port for the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
