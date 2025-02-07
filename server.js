// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let waitingUser  = null;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('findRandom', () => {
        if (waitingUser ) {
            const pairedUser  = waitingUser ;
            waitingUser  = null;
            socket.emit('paired', { id: pairedUser  });
            io.to(pairedUser ).emit('paired', { id: socket.id });
        } else {
            waitingUser  = socket.id;
            socket.emit('waiting');
        }
    });

    socket.on('signal', (data) => {
        socket.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
    });

    socket.on('disconnect', () => {
        console.log('User  disconnected:', socket.id);
        if (waitingUser  === socket.id) {
            waitingUser  = null;
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
