/* --- START OF FILE API.jsx --- */

// 1. Environment & Base Configuration
const _envHost = import.meta.env.VITE_SEVER_HOST_LINK || import.meta.env.VITE_SERVER_HOST_LINK;
export const API_BASE = _envHost;

// 2. Endpoints Map (Extracted from your Routes)
export const ENDPOINTS = {
    login: '/api/login',
    admins: '/api/admin',                 // Note: Controller expects body, so we will use POST in fetch
    departements: '/api/departements',
    employeesBase: '/api/employees',      // Used for both active and date-specific
    attendanceStats: '/api/attendance/stats',
};

// 3. Helper: Build Absolute Image URL
export const makeImagePublicUrl = (imagePathOrUrl) => {
    if (!imagePathOrUrl) return null;
    if (/^https?:\/\//.test(imagePathOrUrl)) return imagePathOrUrl;
    
    // Ensure we don't double slashes if API_BASE ends with /
    const cleanBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const cleanPath = imagePathOrUrl.startsWith('/') ? imagePathOrUrl : `/${imagePathOrUrl}`;
    
    return `${cleanBase}${cleanPath}`;
};

// =========================================================================
// API FETCHING FUNCTIONS
// =========================================================================

/**
 * Login Function
 * Stores result in localStorage on success as requested
 */
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

        // Process Image URL
        if (json.imageUrl) {
            json.imageUrl = makeImagePublicUrl(json.imageUrl);
        }

        // STORE DATA: Saving user info (with image) to LocalStorage
        // This makes it accessible throughout your React app
        localStorage.setItem('user_data', JSON.stringify(json));

        return { status: true, data: json };
    } catch (err) {
        console.error('Login error:', err);
        return { status: false, error: err.message };
    }
};

/**
 * Get Admins
 * NOTE: Your backend controller reads req.body, but route is GET. 
 * Fetch cannot send body in GET. Using POST here. 
 * Ensure backend route is router.post('/admin') or controller reads req.query.
 */
export const getAdmins = async (email) => {
    try {
        const res = await fetch(`${API_BASE}${ENDPOINTS.admins}`, {
            method: 'GET', // Changed to POST to allow sending body
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const json = await res.json().catch(() => ({}));
        if (!res.ok) return { status: false, error: json.error || 'Fetch failed' };
        
        // Process images if array is returned
        const data = Array.isArray(json) 
            ? json.map(admin => ({ ...admin, imagePath: makeImagePublicUrl(admin.imagePath) }))
            : json;

        return { status: true, data };
    } catch (err) {
        return { status: false, error: err.message };
    }
};

/**
 * Get All Departments
 */
export const getDepartements = async () => {
    try {
        const res = await fetch(`${API_BASE}${ENDPOINTS.departements}`);
        const json = await res.json().catch(() => ({}));
        
        if (!res.ok) return { status: false, error: json.error || 'Fetch failed' };
        
        return { status: true, data: json };
    } catch (err) {
        return { status: false, error: err.message };
    }
};

/**
 * Get Active Employees (Present Today)
 */
export const getActiveEmployees = async () => {
    try {
        // Endpoint: /api/employees/active
        const res = await fetch(`${API_BASE}${ENDPOINTS.employeesBase}/active`);
        const json = await res.json().catch(() => ({}));
        
        if (!res.ok) return { status: false, error: json.error || 'Fetch failed' };
        
        return { status: true, data: json };
    } catch (err) {
        return { status: false, error: err.message };
    }
};

/**
 * Get Employees at Specific Date
 * Route in backend: /employees:date (Assumed /employees/:date)
 */
export const getEmployeesAtDate = async (date) => {
    try {
        // Construct URL: /api/employees/2023-12-01
        const res = await fetch(`${API_BASE}${ENDPOINTS.employeesBase}/${date}`);
        const json = await res.json().catch(() => ({}));
        
        if (!res.ok) return { status: false, error: json.error || 'Fetch failed' };
        
        return { status: true, data: json };
    } catch (err) {
        return { status: false, error: err.message };
    }
};

/**
 * Get Attendance Statistics
 * Requires: period, startDate, endDate, departmentId
 */
export const getAttendanceStats = async ({ period, startDate, endDate, departmentId }) => {
    try {
        // Create Query String
        const params = new URLSearchParams({
            period,
            startDate,
            endDate,
            departmentId
        });

        const res = await fetch(`${API_BASE}${ENDPOINTS.attendanceStats}?${params.toString()}`);
        const json = await res.json().catch(() => ({}));
        
        if (!res.ok) return { status: false, error: json.error || 'Fetch failed' };
        
        return { status: true, data: json.data || json }; // Backend returns { message, data: [] }
    } catch (err) {
        return { status: false, error: err.message };
    }
};

