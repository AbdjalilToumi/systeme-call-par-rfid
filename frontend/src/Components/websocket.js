const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3000';

let serverSocket = null;

const pendingRequests = new Map();

export const connectWebSocket = () => {
    // avoiding multiple connections
    if (serverSocket && serverSocket.readyState < 2) { 
        return serverSocket;
    }

    serverSocket = new WebSocket(WEBSOCKET_URL);

    serverSocket.onopen = () => {
        console.log("Connected to backend Web Socket");

        // Send auth message
        serverSocket.send(JSON.stringify({
            type: "AUTH", 
            // No requestId needed for initial auth
            token: window.sessionStorage.getItem("authToken")
        }));
    };

    serverSocket.onmessage = (event) => {
        // Handle different web socket responses
        const response = JSON.parse(event.data);

        // Check if this is a response to a specific request
        if (response.requestId && pendingRequests.has(response.requestId)) {
            const { resolve, reject } = pendingRequests.get(response.requestId);
            if (response.status === 'success') {
                resolve(response.data);
            } else {
                reject(new Error(response.error || 'Request failed'));
            }
            pendingRequests.delete(response.requestId);
            return; 
        }
        
        // Handle server-pushed events that don't have a request ID  
        if (response.type === 'EMPLOYEE_PRESENCE_UPDATE') {
            console.log("Presence update received:", response.payload);
            window.dispatchEvent(new CustomEvent('presenceUpdate', { detail: response.payload }));
            return;
        }

        // Success
        if (response.type === "AUTH_SUCCESS") {
            console.log("SUCCESS: " + response.message);
        }
        // Auth Failure
        else if (response.type === "AUTH_FAILED") {
            window.sessionStorage.removeItem("authToken");
            window.sessionStorage.removeItem("user_data");
            alert(response.message);
        } else {
            console.log("Other requests:", response);
        }
    };

    return serverSocket;
};


export const sendWebSocketRequest = (type, payload = {}) => {
    const executeSend = (resolve, reject) => {
        try {
            const requestId = `req-${Date.now()}-${Math.random()}`;
            const request = {
                type,
                payload,
                requestId
            };

            // Store the promise's resolve/reject functions
            pendingRequests.set(requestId, { resolve, reject });

            // Add a timeout
            setTimeout(() => {
                if (pendingRequests.has(requestId)) {
                    reject(new Error(`Request for '${type}' timed out.`));
                    pendingRequests.delete(requestId);
                }
            }, 15000); // 15-second timeout

            serverSocket.send(JSON.stringify(request));
        } catch (error) {
            reject(error);
        }
    };

    return new Promise((resolve, reject) => {
        if (!serverSocket || serverSocket.readyState === WebSocket.CLOSED) {
            return reject(new Error("WebSocket is not connected or has been closed."));
        }

        if (serverSocket.readyState === WebSocket.OPEN) {
            executeSend(resolve, reject);
        } else if (serverSocket.readyState === WebSocket.CONNECTING) {
            // If connecting, wait for the 'open' event to send the message
            const openListener = () => {
                executeSend(resolve, reject);
                serverSocket.removeEventListener('open', openListener);
            };
            serverSocket.addEventListener('open', openListener);
        }
    });
};

export const disconnectWebSocket = () => {
    if (serverSocket) {
        serverSocket.close();
        serverSocket = null;
        console.log("WebSocket disconnected.");
    }
};