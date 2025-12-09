# Frontend Attendance System
YOU SHOULD EXECUTE THE CREATION AND INSERT DATABASE SCRIPTS
This is the frontend for the RFID-based attendance system, built with React and Vite. It provides the user interface to interact with the attendance data managed by the backend server.

## Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/)
*   [npm](https://www.npmjs.com/) (Node Package Manager)

## Getting Started

Follow these steps to get the frontend application up and running on your local machine.

### 1. Navigate to the Frontend Directory

```bash
cd systeme-call-par-rfid/frontend
```

### 2. Install Dependencies

Run the following command to install the required node modules:

```bash
npm install
```

### 3. Environment Configuration

The application requires a `.env` file in the `frontend` directory to connect to the backend API and WebSocket server. Create a file named `.env` and add the following content.

*Note: These URLs should match the host and port where your backend and WebSocket servers are running.*

```dotenv
VITE_API_BASE_URL="http://localhost:3000/api"
VITE_WEBSOCKET_URL="ws://localhost:8080"
```

### 4. Start the Development Server

To start the Vite development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Features

*   **User Dashboard**: View a list of all registered users.
*   **Attendance Log**: See a complete history of all attendance records.
*   **Real-Time Updates**: Attendance data is updated in real-time using WebSockets, providing instant feedback as users check in or out.
