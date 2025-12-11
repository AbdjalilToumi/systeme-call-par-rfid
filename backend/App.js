import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws'; 
import loginRoute from './Routes/loginRoute.js';
import { verifyToken } from './Routes/auth.js';
import { getActiveEmployees, getEmpleyesAtDate, getEmployeeByUID } from "./Controllers/EmployeController.js";
import { getDepartements } from "./Controllers/DepartementController.js";
import { getAttendanceStats, createAttendanceRecord } from "./Controllers/AttendanceController.js";

const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;
const EXTERNAL_WS_URL = process.env.WEBSOCKET_URL || 'ws://localhost:8080'; 

// Middleware
app.use(cors());
app.use(express.json());

// serve profile images statically
app.use('/profileImage', express.static(path.join(process.cwd(), 'profileImage')));


app.use('/api', loginRoute);
// Test route
app.get('/', (req, res) => {
  res.send('Invalid endpoint. Please use /api/* endpoints for REST API access.');
});

let externalWs; 

const connectToExternalWebSocket = () => {
    externalWs = new WebSocket(EXTERNAL_WS_URL);

    externalWs.on('open', () => {
        console.log(` Connected to external WebSocket server at: ${EXTERNAL_WS_URL}`);
    });

    externalWs.on('message', async (dataBuffer) => {
      try {
        const messageString = dataBuffer.toString(); 
        const data = JSON.parse(messageString);
        
        const UID = data.uid || 'Unknown UID';
        const timeString = data.time.replace(' ', 'T');
        const arrivalTime = new Date(timeString);
        
        // Validate the parsed date before using it
        if (isNaN(arrivalTime.getTime())) {
          console.error(`Received invalid time value from WebSocket. Raw time: "${data.time}"`);
          return;
        }

        console.log(` Received from external WS - UID: ${UID}, Time: ${arrivalTime.toISOString()}`);

        const employee = await getEmployeeByUID(UID);
        console.log(employee);
        if (!employee) {
            console.log(` No employee found for UID: ${UID}`);
            return;
        }

        const today = arrivalTime.toISOString().split('T')[0]; // YYYY-MM-DD
        const workStartTime = new Date(`${today}T${employee.workStartTime}`);
        const workEndTime = new Date(`${today}T${employee.workEndTime}`);
        const gracePeriodEnd = new Date(workStartTime.getTime() + employee.gracePeriodMinutes * 60000);
        
        // Check if IN or OUT
        // Logic: If arrival is before 4 hours past start time, it's a check-in. Otherwise, it's a check-out.
        const checkInCutoff = new Date(workStartTime.getTime() + 4 * 60 * 60 * 1000);

        let status;
        let type = 'in';

        if (arrivalTime < checkInCutoff) {
            // It's a in
            if (arrivalTime <= gracePeriodEnd) {
                status = 'on-time';
            } else {
                status = 'late';
            }
        } else {
            // It's a out
            type = 'out';
            if (arrivalTime < workEndTime) {
                status = 'early-leave';
            } else {
                status = 'leave';
            }
        }

        
        // save the arrives or presence of the employee
        const attendance = await createAttendanceRecord({ employeeId: employee.id, timestamp: arrivalTime,type: type, status: status });
        console.log(` Attendance recorded for ${employee.firstName}: ${type} - ${status}`);

        // broadcast to all connected clients
        const broadcastMessage = {
            type: 'EMPLOYEE_PRESENCE_UPDATE',
            payload: {
                status: type,  
                employee: { ...employee, status: status }
            }
        };
        authenticatedClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(broadcastMessage));
            }
        });

      } catch (error) {
        console.error('Failed to process incoming WebSocket message. Error:', error.message);
        console.error('Raw message:', dataBuffer.toString());
      }
    });

    externalWs.on('close', () => {
        console.log('❌ Disconnected from external WebSocket server. Attempting reconnect in 5s...');
        setTimeout(connectToExternalWebSocket, 5000); 
    });

    externalWs.on('error', (err) => {
        // Handle connection refused errors cleanly
        if(err.code === 'ECONNREFUSED') {
            console.error('WebSocket connection refused. Is the server.js running?');
        } else {
            console.error('WebSocket error:', err.message);
        }
        externalWs.terminate(); // Ensure socket is closed before reconnecting
    });
};



// 1. Start the HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (REST API)`);
  connectToExternalWebSocket();
});

// create a websocket server on top of the existing HTTP server
const wss = new WebSocketServer({ server });
const authenticatedClients = new Map();
wss.on('connection', (ws) => {
  console.log(' New client connected to WebSocket server');

  let authenticatedUserEmail = null;
  ws.on('message', (message) => {
    try {
      const parsedMessage = JSON.parse(message.toString());

      // Verifiy the Message and it's Type
      if(parsedMessage.type === 'AUTH' && parsedMessage.token){
        const decodedToken = verifyToken(parsedMessage.token);

        if(decodedToken && decodedToken.email){
          // Sotre the authentificated Users in Map 
          authenticatedUserEmail = decodedToken.email;
          authenticatedClients.set(authenticatedUserEmail, ws);

          console.log(` Client authenticated via WebSocket: ${authenticatedUserEmail}`);
          // Send to user reponse 
          ws.send(JSON.stringify({ type: 'AUTH_SUCCESS', message: 'WebSocket authentication successful.' }));
        }
        else {
          // Error Authentifation FAILD
          ws.send(JSON.stringify({ type: 'AUTH_FAILED', message: 'Invalid or expired token.' }));
          ws.close(1008, 'Authentication failed'); 
        }
      } 
      else if (!authenticatedUserEmail) {
        // is not authentificated
        ws.send(JSON.stringify({ type: 'ERROR', message: 'Authentication is required.' }));
        ws.close(1008, 'Authentication required');
      } else {
        // HANDLE OTHERS Client Requets 
        const { type, payload, requestId } = parsedMessage;

        const sendResponse = (status, data, error = null) => {
          ws.send(JSON.stringify({
            type: `${type}_RESPONSE`, 
            status,
            requestId,
            data,
            error
          }));
        };

        switch (type) {
          case 'GET_DEPARTMENTS':
            (async () => {
              try {
                const rows  = await getDepartements();
                sendResponse('success', rows);
              } catch (error) {
                console.error('Error fetching departments:', error);
                sendResponse('error', null, 'Failed to fetch departments.');
              }
            })();
            break;

          case 'GET_ACTIVE_EMPLOYEES':
            (async () => {
              try {
                const rows = await getActiveEmployees();
                sendResponse('success', rows);
              } catch (error) {
                console.error('Error fetching active employees:', error);
                sendResponse('error', null, error.message || 'Failed to fetch active employees.');
              }
            })();
            break;

          case 'GET_EMPLOYEES_AT_DATE':
            (async () => {
              const { date } = payload;
              try {
                if (!date) {
                  return sendResponse('error', null, 'Date is required for GET_EMPLOYEES_AT_DATE request.');
                }
                const rows = await getEmpleyesAtDate(date);
                sendResponse('success', rows);
              } 
              catch (error) {
                console.error(`Error fetching employees for date ${date}:`, error);
                sendResponse('error', null, error.message || `Failed to fetch employees for date ${date}.`);
              }
            })();
            break;

          case 'GET_ATTENDANCE_STATS':
            (async () => {
              try {
                const stats = await getAttendanceStats(payload);
                sendResponse('success', stats);
              } catch (error) {
                console.error('Error fetching attendance stats:', error);
                sendResponse('error', null, error.message || 'Failed to fetch attendance stats.');
              }
            })();
            break;

          default:
            console.log(` Received unknown message type from ${authenticatedUserEmail}:`, parsedMessage);
            sendResponse('error', null, `Unknown message type: ${type}`);
            break;
        }
        // Handle messages from authenticated clients
        console.log(` Received message from authenticated client ${authenticatedUserEmail}:`, parsedMessage);
      } 
    }
    catch(err){
      console.log("Error : " + err);
    }
  });

  ws.on('close', () => {  
    if(authenticatedUserEmail){
      authenticatedClients.delete(authenticatedUserEmail);
      console.log(`❌ Client ${authenticatedUserEmail} disconnected from WebSocket server`);
    } else {
      console.log('Unauthenticated client disconnected from WebSocket server');
    }
  });

});
