import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
// Use the 'ws' library for both server (if needed later) and client connection
import { WebSocketServer, WebSocket } from 'ws'; 

import loginRoute from './Routes/loginRoute.js';
import departementRoute from './Routes/DepartementRoute.js';
import employeRoute from './Routes/EmployeRoute.js';
import attendanceRoute from './Routes/AttendanceRoute.js';

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;
const EXTERNAL_WS_URL = process.env.WEBSOCKET_URL || 'ws://localhost:8080'; // New environment variable

// Middleware
app.use(cors());
app.use(express.json());

// Serve profile images statically
app.use('/profileImage', express.static(path.join(process.cwd(), 'profileImage')));

// Mount API routes under /api (Your existing REST API setup)
app.use('/api', loginRoute);
app.use('/api', departementRoute);
app.use('/api', employeRoute);
app.use('/api', attendanceRoute);

// Test route
app.get('/', (req, res) => {
  res.send('Invalid endpoint. Please use /api/* endpoints for REST API access.');
});

let externalWs; 

const connectToExternalWebSocket = () => {
    externalWs = new WebSocket(EXTERNAL_WS_URL);

    externalWs.on('open', () => {
        console.log(`✅ Connected to external WebSocket server at: ${EXTERNAL_WS_URL}`);
    });

    externalWs.on('message', (dataBuffer) => {
      try {
        const messageString = dataBuffer.toString(); 
        const data = JSON.parse(messageString);      
        
        const UID = data.uid || 'Unknown UID';
        const time = new Date(data.time);

        console.log(`📩 Received from external WS - UID: ${UID}, Time: ${time.toISOString()}`);
        

      } catch (error) {
        console.error('⚠️ Failed to parse incoming JSON. Raw message:', dataBuffer.toString());
      }
    });

    externalWs.on('close', () => {
        console.log('❌ Disconnected from external WebSocket server. Attempting reconnect in 5s...');
        setTimeout(connectToExternalWebSocket, 5000); 
    });

    externalWs.on('error', (err) => {
        // Handle connection refused errors cleanly
        if(err.code === 'ECONNREFUSED') {
            console.error('⚠️ WebSocket connection refused. Is the server.js running?');
        } else {
            console.error('⚠️ WebSocket error:', err.message);
        }
        externalWs.terminate(); // Ensure socket is closed before reconnecting
    });
};



// 1. Start the HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (REST API)`);
  connectToExternalWebSocket();
});
