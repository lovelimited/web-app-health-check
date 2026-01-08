/**
 * ====================================================
 * API Module - Health Tracker
 * ====================================================
 * จัดการการสื่อสารกับ Google Apps Script Backend
 */

// ====================================================
// CONFIGURATION
// ====================================================

/**
 * URL ของ Google Apps Script Web App
 * ⚠️ เปลี่ยนเป็น URL จริงหลัง deploy
 */
const API_URL = 'https://script.google.com/macros/s/AKfycbzCSROlHKA-nTbmKvyfClj4yn4qiftTicGVyzesODHm5nMuJ_PcbfpsMLiWJVH4JMlBtA/exec';

// ====================================================
// API CALLER
// ====================================================

/**
 * เรียก API หลัก
 * @param {string} action - ชื่อ action ที่ต้องการเรียก
 * @param {Object} params - พารามิเตอร์เพิ่มเติม
 * @returns {Promise<Object>} - ผลลัพธ์จาก API
 */
async function callAPI(action, params = {}) {
    try {
        const requestBody = {
            action: action,
            ...params
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            error: error.message || 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
        };
    }
}

// ====================================================
// API FUNCTIONS
// ====================================================

/**
 * Login
 * @param {string} username 
 * @param {string} password 
 */
async function apiLogin(username, password) {
    return await callAPI('login', { username, password });
}

/**
 * Logout
 * @param {string} token 
 */
async function apiLogout(token) {
    return await callAPI('logout', { token });
}

/**
 * Get user profile
 * @param {string} token 
 */
async function apiGetMyProfile(token) {
    return await callAPI('getMyProfile', { token });
}

/**
 * Get health timeline data
 * @param {string} token 
 * @param {string} viewType - 'daily' or 'monthly'
 */
async function apiGetMyTimeline(token, viewType) {
    return await callAPI('getMyTimeline', { token, viewType });
}

/**
 * Change password
 * @param {string} token 
 * @param {string} oldPassword 
 * @param {string} newPassword 
 */
async function apiChangePassword(token, oldPassword, newPassword) {
    return await callAPI('changePassword', { token, oldPassword, newPassword });
}

/**
 * Admin: Get all users
 * @param {string} token 
 */
async function apiAdminGetUsers(token) {
    return await callAPI('adminGetUsers', { token });
}

/**
 * Admin: Reset user password
 * @param {string} token 
 * @param {string} targetUserId 
 */
async function apiAdminResetPassword(token, targetUserId) {
    return await callAPI('adminResetPassword', { token, targetUserId });
}
