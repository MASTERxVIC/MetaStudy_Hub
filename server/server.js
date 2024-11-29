const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the "public" directory
app.use(express.static('public'));

// Store connected players
let players = [];

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Handle player joining
    socket.on('join', ({ username, color }) => {
        const player = { id: socket.id, username, color };
        players.push(player);

        console.log(`${username} joined with color ${color}`);

        // Notify all players of the new player
        io.emit('chat-message', {
            user: 'GameBot',
            message: `${username} has joined the chat!`,
            color: '#FF0000',
        });
    });

    // Handle chat messages
    socket.on('send-message', ({ message, username, color }) => {
        if (username && message) {
            console.log(`${username} says: ${message}`);
            io.emit('chat-message', { user: username, message, color });
        } else {
            console.log('Message or username is missing!');
        }
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        const player = players.find((p) => p.id === socket.id);
        if (player) {
            console.log(`${player.username} disconnected`);
            players = players.filter((p) => p.id !== socket.id);

            io.emit('chat-message', {
                user: 'GameBot',
                message: `${player.username} has left the chat.`,
                color: '#FF0000',
            });
        }
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
