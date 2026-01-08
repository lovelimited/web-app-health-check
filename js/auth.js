/**
 * ====================================================
 * Auth Module - Health Tracker
 * ====================================================
 * จัดการ Authentication และ Session
 */

// ====================================================
// SESSION STORAGE KEYS
// ====================================================

const SESSION_TOKEN_KEY = 'health_tracker_token';
const SESSION_ROLE_KEY = 'health_tracker_role';
const SESSION_USERNAME_KEY = 'username';

// ====================================================
// SESSION MANAGEMENT
// ====================================================

/**
 * Get token from sessionStorage
 * @returns {string|null}
 */
function getToken() {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
}

/**
 * Get role from sessionStorage
 * @returns {string|null}
 */
function getRole() {
    return sessionStorage.getItem(SESSION_ROLE_KEY);
}

/**
 * Get username from sessionStorage
 * @returns {string|null}
 */
function getUsername() {
    return sessionStorage.getItem(SESSION_USERNAME_KEY);
}

/**
 * Set session data
 * @param {string} token 
 * @param {string} role 
 * @param {string} username 
 */
function setSession(token, role, username) {
    sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    sessionStorage.setItem(SESSION_ROLE_KEY, role);
    sessionStorage.setItem(SESSION_USERNAME_KEY, username);
}

/**
 * Clear session (logout)
 */
function clearSession() {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_ROLE_KEY);
    sessionStorage.removeItem(SESSION_USERNAME_KEY);
}

// ====================================================
// AUTHENTICATION FUNCTIONS
// ====================================================

/**
 * Login
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<Object>}
 */
async function login(username, password) {
    const result = await callAPI('login', { username, password });
    return result;
}

/**
 * Logout
 * @returns {Promise<Object>}
 */
async function logout() {
    const token = getToken();
    if (token) {
        await callAPI('logout', { token });
    }
    clearSession();
    return { success: true };
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
async function checkAuth() {
    const token = getToken();

    if (!token) {
        return false;
    }

    try {
        const result = await callAPI('getMyProfile', { token });
        return result.success;
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
}

/**
 * Check if user is admin
 * @returns {boolean}
 */
function isAdmin() {
    return getRole() === 'admin';
}

/**
 * Require authentication - redirect to login if not authenticated
 * @param {string} redirectUrl - URL to redirect to if not authenticated
 */
async function requireAuth(redirectUrl = 'login.html') {
    const isAuth = await checkAuth();

    if (!isAuth) {
        clearSession();
        window.location.href = redirectUrl;
        return false;
    }

    return true;
}

/**
 * Require admin role
 * @param {string} redirectUrl - URL to redirect to if not admin
 */
async function requireAdmin(redirectUrl = 'dashboard.html') {
    const isAuth = await requireAuth();

    if (!isAuth) {
        return false;
    }

    if (!isAdmin()) {
        window.location.href = redirectUrl;
        return false;
    }

    return true;
}
