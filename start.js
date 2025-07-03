const { spawn } = require('child_process');
const path = require('path');

console.log('Starting NoteNest application...');

// Set production environment
process.env.NODE_ENV = 'production';

// Start the server
const server = spawn('node', ['Backend/server.js'], {
    stdio: 'inherit',
    cwd: __dirname
});

server.on('error', (error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    server.kill('SIGTERM');
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully...');
    server.kill('SIGINT');
}); 