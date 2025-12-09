// server.js
const WebSocket = require('ws');
const PORT = 8080;

const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', function connection(ws) {
  console.log('A new client connected!');
  
  ws.on('message', function incoming(message) {
    try {
      const parsedMsg = JSON.parse(message);
      console.log('Received from client:', parsedMsg.message);
      
      const response = { 
        message: `Server received your text: "${parsedMsg.message}"`,
        timestamp: new Date().toISOString()
      };

      
      ws.send(JSON.stringify(response));

      ws.send(JSON.stringify({ UID: "DDDDD", time: Date.now() }));
    } catch (error) {
      console.error('Error parsing message:', error);
      ws.send(JSON.stringify({ message: "Error: Could not parse JSON data" }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
console.log('Waiting for clients to connect...');