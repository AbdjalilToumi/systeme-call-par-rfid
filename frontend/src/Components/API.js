const _envHost = import.meta.env.VITE_SEVER_HOST_LINK || import.meta.env.VITE_SERVER_HOST_LINK;
import { connectWebSocket, sendWebSocketRequest } from "./websocket";
export const API_BASE = _envHost;

// Endpoints
export const ENDPOINTS = {
    login: '/api/login',
    admins: '/api/admin',                 
    departements: '/api/departements',
    employeesBase: '/api/employees',   
    attendanceStats: '/api/attendance/stats',
};

// Check if the user already authentificate
if (sessionStorage.getItem('authToken')) {
    connectWebSocket();
}

// Helper Functions to process image paths/URLs
export const makeImagePublicUrl = (imagePathOrUrl) => {
    if (!imagePathOrUrl) return null;
    if (/^https?:\/\//.test(imagePathOrUrl)) return imagePathOrUrl;
    
    const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const cleanPath = imagePathOrUrl.startsWith('/') ? imagePathOrUrl : `/${imagePathOrUrl}`;
    
    return `${cleanBase}${cleanPath}`;
};


// Functions for API Calls for Login
export const login = async (email, password) => {
    try {
        const res = await fetch(`${API_BASE}${ENDPOINTS.login}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
            return { status: false, error: json.error || 'Login failed' };
        }

        // process Image URL
        if (json.imageUrl) {
            json.imageUrl = makeImagePublicUrl(json.imageUrl);
        }

        // Store user data in session storage
        sessionStorage.setItem('user_data', JSON.stringify(json));
        return { status: true, data: json };
    
    } catch (err) {
        console.error('Login error:', err);
        return { status: false, error: err.message };
    }
};

export const getDepartements = async () => {
    // Use WebSocket to get departments
    try {
        const data = await sendWebSocketRequest('GET_DEPARTMENTS');
        return { status: true, data: data };
    } catch (error) {
        console.error('WebSocket error getting departments:', error);
        return { status: false, error: error.message || 'Failed to get departments via WebSocket' };
    }
};

// Functions for getting active today active employees 
export const getActiveEmployees = async () => {
    try {
        const data = await sendWebSocketRequest('GET_ACTIVE_EMPLOYEES');
        return { status: true, data: data };
    } catch (error) {
        console.error('WebSocket error getting active employees:', error);
        return { status: false, error: error.message || 'Failed to get active employees via WebSocket' };
    }
};

//Functions for getting active employees active at a date 
export const getEmployeesAtDate = async (date) => {
    try {
        const data = await sendWebSocketRequest('GET_EMPLOYEES_AT_DATE', { date });
        return { status: true, data: data };
    } catch (error) {
        console.error('WebSocket error getting employees by date:', error);
        return { status: false, error: error.message || 'Failed to get employees by date via WebSocket' };
    }
};

// Functions for getting attendances stats 
export const getAttendanceStats = async ({ period, startDate, endDate, departmentId }) => {
    try {
        const data = await sendWebSocketRequest('GET_ATTENDANCE_STATS', { period, startDate, endDate, departmentId });
        return { status: true, data: data };
    } catch (error) {
        console.error('WebSocket error getting attendance stats:', error);
        return { status: false, error: error.message || 'Failed to get attendance stats via WebSocket' };
    }
};
