# Backend Attendance System
YOU SHOULD EXECUTE THE CREATION AND INSERT DATABASE SCRIPTS
This is the backend server for the RFID-based attendance system. It handles the business logic, database interactions, and provides a RESTful API for the frontend.

## Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/)
*   [npm](https://www.npmjs.com/) (Node Package Manager)

## Getting Started

Follow these steps to get the backend server up and running on your local machine.

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd systeme-call-par-rfid/backend
```

### 2. Install Dependencies

Run the following command to install the required node modules:

```bash
npm install
```

### 3. Environment Configuration

The server requires a `.env` file in the `backend` directory for configuration. Create a file named `.env` and add the following content.

```dotenv
DATABASE_HOST="localhost"
DATABASE_USER="toumi"
DATABASE_PASSWORD="Toumi@20052005"
DATABASE_NAME="attendance_system"
PORT=3000
WEBSOCKET_URL="ws://localhost:8080"
```

### 4. Start the Server

To start the server, run:

```bash
npm start
```

The server will start on the port specified in your `.env` file (default is `3000`).

## API Endpoints

The following are the primary API endpoints provided by the server.

### User Management

*   `GET /api/users`
    *   **Description**: Retrieves a list of all registered users.
*   `POST /api/users`
    *   **Description**: Creates a new user. Expects user data in the request body.

### Attendance

*   `GET /api/attendance`
    *   **Description**: Retrieves all attendance records.
*   `POST /api/attendance/check`
    *   **Description**: This is the core endpoint for recording attendance. It receives the RFID tag ID from the RFID reader, validates it, and records the check-in or check-out time for the corresponding user.

### WebSocket

The server also communicates with a WebSocket server at the URL specified by `WEBSOCKET_URL`. This is used for real-time communication, such as pushing live attendance updates to connected clients.