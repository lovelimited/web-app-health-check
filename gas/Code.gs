/**
 * ====================================================
 * Health Tracking Web Application - Google Apps Script
 * ====================================================
 * Backend API สำหรับระบบติดตามสุขภาพรายบุคคล
 * 
 * Security Features:
 * - SHA-256 password hashing with salt
 * - Session token via CacheService (30 นาที)
 * - Token → user_id lookup only
 * - Role-based access control
 */

// ====================================================
// CONFIGURATION
// ====================================================
 
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // ← เปลี่ยนเป็น ID ของ Google Sheets
const TOKEN_EXPIRY_SECONDS = 1800; // 30 นาที
const TEMP_PASSWORD_LENGTH = 8;

// Sheet names
const SHEET_USER = 'user';
const SHEET_WEIGHT_BMI = 'น้ำหนัก-ส่วนสูง-bmi';
const SHEET_BLOOD_PRESSURE = 'ความดันโลหิต';
const SHEET_O2 = 'O2ในเลือด';
const SHEET_SUGAR = 'น้ำตาลในเลือด';

// ====================================================
// MAIN ENTRY POINT - doPost
// ====================================================

/**
 * จัดการ HTTP POST requests ทั้งหมด
 * @param {Object} e - Event object จาก Apps Script
 * @returns {TextOutput} JSON response
 */
function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    
    let result;
    
    switch (action) {
      case 'login':
        result = login(params.username, params.password);
        break;
        
      case 'logout':
        result = logout(params.token);
        break;
        
      case 'getMyProfile':
        result = getMyProfile(params.token);
        break;
        
      case 'getMyTimeline':
        result = getMyTimeline(params.token, params.viewType);
        break;
        
      case 'changePassword':
        result = changePassword(params.token, params.oldPassword, params.newPassword);
        break;
        
      case 'adminResetPassword':
        result = adminResetPassword(params.token, params.targetUserId);
        break;
        
      case 'adminGetUsers':
        result = adminGetUsers(params.token);
        break;
        
      default:
        result = { success: false, error: 'Unknown action' };
    }
    
    return createJsonResponse(result);
    
  } catch (error) {
    return createJsonResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * สร้าง JSON response
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ====================================================
// AUTHENTICATION FUNCTIONS
// ====================================================

/**
 * Login - ตรวจสอบ credentials และสร้าง session token
 */
function login(username, password) {
  if (!username || !password) {
    return { success: false, error: 'กรุณากรอก username และ password' };
  }
  
  const sheet = getSheet(SHEET_USER);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // หา column indexes
  const colUsername = headers.indexOf('username');
  const colPasswordHash = headers.indexOf('password_hash');
  const colUserId = headers.indexOf('user_id');
  const colRole = headers.indexOf('role');
  const colMustChange = headers.indexOf('must_change_password');
  
  // ค้นหา user
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[colUsername] === username) {
      // ตรวจสอบ password
      const storedHash = row[colPasswordHash];
      const inputHash = hashPassword(password, getSaltFromHash(storedHash));
      
      if (storedHash === inputHash) {
        // สร้าง session token
        const token = generateToken();
        const userId = row[colUserId];
        const role = row[colRole];
        const mustChangePassword = row[colMustChange] === true || row[colMustChange] === 'TRUE';
        
        // เก็บ token ใน CacheService
        const cache = CacheService.getScriptCache();
        cache.put(token, JSON.stringify({
          userId: userId,
          role: role,
          username: username
        }), TOKEN_EXPIRY_SECONDS);
        
        return {
          success: true,
          token: token,
          role: role,
          username: username,
          mustChangePassword: mustChangePassword
        };
      } else {
        return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
      }
    }
  }
  
  return { success: false, error: 'ไม่พบผู้ใช้นี้ในระบบ' };
}

/**
 * Logout - ลบ session token
 */
function logout(token) {
  if (!token) {
    return { success: false, error: 'ไม่พบ token' };
  }
  
  const cache = CacheService.getScriptCache();
  cache.remove(token);
  
  return { success: true, message: 'ออกจากระบบสำเร็จ' };
}

/**
 * ตรวจสอบ token และคืน user data
 */
function validateToken(token) {
  if (!token) {
    return null;
  }
  
  const cache = CacheService.getScriptCache();
  const userData = cache.get(token);
  
  if (!userData) {
    return null;
  }
  
  return JSON.parse(userData);
}

/**
 * สร้าง random token
 */
function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token + '_' + new Date().getTime();
}

// ====================================================
// PASSWORD HASHING
// ====================================================

/**
 * Hash password ด้วย SHA-256 + salt
 * Format: salt$hash
 */
function hashPassword(password, salt) {
  if (!salt) {
    salt = generateSalt();
  }
  const hash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, 
    salt + password
  );
  const hashHex = hash.map(byte => {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
  
  return salt + '$' + hashHex;
}

/**
 * สร้าง random salt
 */
function generateSalt() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < 16; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

/**
 * ดึง salt จาก stored hash
 */
function getSaltFromHash(storedHash) {
  if (!storedHash || storedHash.indexOf('$') === -1) {
    return '';
  }
  return storedHash.split('$')[0];
}

/**
 * สร้างรหัสผ่านชั่วคราว
 */
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ====================================================
// PROFILE & DATA FUNCTIONS
// ====================================================

/**
 * ดึงข้อมูลโปรไฟล์ผู้ใช้
 */
function getMyProfile(token) {
  const userData = validateToken(token);
  if (!userData) {
    return { success: false, error: 'Session หมดอายุ กรุณา login ใหม่' };
  }
  
  return {
    success: true,
    profile: {
      userId: userData.userId,
      username: userData.username,
      role: userData.role
    }
  };
}

/**
 * ดึงข้อมูลสุขภาพตาม timeline (daily/monthly)
 */
function getMyTimeline(token, viewType) {
  const userData = validateToken(token);
  if (!userData) {
    return { success: false, error: 'Session หมดอายุ กรุณา login ใหม่' };
  }
  
  const userId = userData.userId;
  viewType = viewType || 'daily';
  
  // ดึงข้อมูลจากทุก sheet
  const weightBmiData = getWeightBmiData(userId, viewType);
  const bloodPressureData = getBloodPressureData(userId, viewType);
  const o2Data = getO2Data(userId, viewType);
  const sugarData = getSugarData(userId, viewType);
  
  return {
    success: true,
    viewType: viewType,
    data: {
      weightBmi: weightBmiData,
      bloodPressure: bloodPressureData,
      o2: o2Data,
      sugar: sugarData
    }
  };
}

/**
 * ดึงและประมวลผลข้อมูล น้ำหนัก-ส่วนสูง-BMI
 */
function getWeightBmiData(userId, viewType) {
  const sheet = getSheet(SHEET_WEIGHT_BMI);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colUserId = headers.indexOf('user_id');
  const colDate = headers.indexOf('date');
  const colWeight = headers.indexOf('weight');
  const colHeight = headers.indexOf('height');
  const colBmi = headers.indexOf('bmi');
  
  // Filter ข้อมูลของ user นี้
  const userRecords = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][colUserId] == userId) {
      userRecords.push({
        date: formatDate(data[i][colDate]),
        weight: parseFloat(data[i][colWeight]) || 0,
        height: parseFloat(data[i][colHeight]) || 0,
        bmi: parseFloat(data[i][colBmi]) || 0
      });
    }
  }
  
  return aggregateData(userRecords, viewType, ['weight', 'height', 'bmi']);
}

/**
 * ดึงและประมวลผลข้อมูลความดันโลหิต
 */
function getBloodPressureData(userId, viewType) {
  const sheet = getSheet(SHEET_BLOOD_PRESSURE);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colUserId = headers.indexOf('user_id');
  const colDate = headers.indexOf('date');
  const colSys = headers.indexOf('sys');
  const colDia = headers.indexOf('dia');
  const colPul = headers.indexOf('pul');
  const colStatus = headers.indexOf('status');
  
  const userRecords = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][colUserId] == userId) {
      userRecords.push({
        date: formatDate(data[i][colDate]),
        sys: parseFloat(data[i][colSys]) || 0,
        dia: parseFloat(data[i][colDia]) || 0,
        pul: parseFloat(data[i][colPul]) || 0,
        status: data[i][colStatus] || ''
      });
    }
  }
  
  return aggregateData(userRecords, viewType, ['sys', 'dia', 'pul']);
}

/**
 * ดึงและประมวลผลข้อมูล O2 ในเลือด
 */
function getO2Data(userId, viewType) {
  const sheet = getSheet(SHEET_O2);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colUserId = headers.indexOf('user_id');
  const colDate = headers.indexOf('date');
  const colSpo2 = headers.indexOf('spo2');
  
  const userRecords = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][colUserId] == userId) {
      userRecords.push({
        date: formatDate(data[i][colDate]),
        spo2: parseFloat(data[i][colSpo2]) || 0
      });
    }
  }
  
  return aggregateData(userRecords, viewType, ['spo2']);
}

/**
 * ดึงและประมวลผลข้อมูลน้ำตาลในเลือด
 */
function getSugarData(userId, viewType) {
  const sheet = getSheet(SHEET_SUGAR);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colUserId = headers.indexOf('user_id');
  const colDate = headers.indexOf('date');
  const colSugar = headers.indexOf('sugar');
  
  const userRecords = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][colUserId] == userId) {
      userRecords.push({
        date: formatDate(data[i][colDate]),
        sugar: parseFloat(data[i][colSugar]) || 0
      });
    }
  }
  
  return aggregateData(userRecords, viewType, ['sugar']);
}

// ====================================================
// DATA AGGREGATION
// ====================================================

/**
 * คำนวณค่าเฉลี่ยตาม viewType (daily/monthly)
 */
function aggregateData(records, viewType, numericFields) {
  if (!records || records.length === 0) {
    return [];
  }
  
  // Group by date/month
  const grouped = {};
  
  records.forEach(record => {
    let key;
    if (viewType === 'monthly') {
      // ใช้ YYYY-MM
      key = record.date.substring(0, 7);
    } else {
      // ใช้ YYYY-MM-DD
      key = record.date;
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(record);
  });
  
  // คำนวณค่าเฉลี่ย
  const results = [];
  const sortedKeys = Object.keys(grouped).sort();
  
  sortedKeys.forEach(key => {
    const group = grouped[key];
    const avgRecord = { date: key };
    
    numericFields.forEach(field => {
      const values = group.map(r => r[field]).filter(v => v > 0);
      if (values.length > 0) {
        avgRecord[field] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
      } else {
        avgRecord[field] = 0;
      }
    });
    
    results.push(avgRecord);
  });
  
  return results;
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(dateValue) {
  if (!dateValue) return '';
  
  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else {
    date = new Date(dateValue);
  }
  
  if (isNaN(date.getTime())) {
    return String(dateValue);
  }
  
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  
  return `${year}-${month}-${day}`;
}

// ====================================================
// PASSWORD MANAGEMENT
// ====================================================

/**
 * เปลี่ยนรหัสผ่าน
 */
function changePassword(token, oldPassword, newPassword) {
  const userData = validateToken(token);
  if (!userData) {
    return { success: false, error: 'Session หมดอายุ กรุณา login ใหม่' };
  }
  
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' };
  }
  
  const sheet = getSheet(SHEET_USER);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colUserId = headers.indexOf('user_id');
  const colPasswordHash = headers.indexOf('password_hash');
  const colMustChange = headers.indexOf('must_change_password');
  
  // หา row ของ user
  for (let i = 1; i < data.length; i++) {
    if (data[i][colUserId] == userData.userId) {
      // ตรวจสอบรหัสเดิม (ยกเว้นกรณี must_change_password)
      const mustChange = data[i][colMustChange] === true || data[i][colMustChange] === 'TRUE';
      
      if (!mustChange && oldPassword) {
        const storedHash = data[i][colPasswordHash];
        const inputHash = hashPassword(oldPassword, getSaltFromHash(storedHash));
        
        if (storedHash !== inputHash) {
          return { success: false, error: 'รหัสผ่านเดิมไม่ถูกต้อง' };
        }
      }
      
      // เปลี่ยนรหัสผ่าน
      const newHash = hashPassword(newPassword, null);
      sheet.getRange(i + 1, colPasswordHash + 1).setValue(newHash);
      sheet.getRange(i + 1, colMustChange + 1).setValue(false);
      
      return { success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
    }
  }
  
  return { success: false, error: 'ไม่พบข้อมูลผู้ใช้' };
}

// ====================================================
// ADMIN FUNCTIONS
// ====================================================

/**
 * Admin: ดึงรายชื่อผู้ใช้ทั้งหมด
 */
function adminGetUsers(token) {
  const userData = validateToken(token);
  if (!userData) {
    return { success: false, error: 'Session หมดอายุ กรุณา login ใหม่' };
  }
  
  if (userData.role !== 'admin') {
    return { success: false, error: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' };
  }
  
  const sheet = getSheet(SHEET_USER);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colUserId = headers.indexOf('user_id');
  const colUsername = headers.indexOf('username');
  const colRole = headers.indexOf('role');
  const colMustChange = headers.indexOf('must_change_password');
  
  const users = [];
  for (let i = 1; i < data.length; i++) {
    users.push({
      userId: data[i][colUserId],
      username: data[i][colUsername],
      role: data[i][colRole],
      mustChangePassword: data[i][colMustChange] === true || data[i][colMustChange] === 'TRUE'
    });
  }
  
  return { success: true, users: users };
}

/**
 * Admin: Reset password ของผู้ใช้
 */
function adminResetPassword(token, targetUserId) {
  const userData = validateToken(token);
  if (!userData) {
    return { success: false, error: 'Session หมดอายุ กรุณา login ใหม่' };
  }
  
  if (userData.role !== 'admin') {
    return { success: false, error: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' };
  }
  
  if (!targetUserId) {
    return { success: false, error: 'กรุณาระบุ user_id' };
  }
  
  const sheet = getSheet(SHEET_USER);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const colUserId = headers.indexOf('user_id');
  const colPasswordHash = headers.indexOf('password_hash');
  const colMustChange = headers.indexOf('must_change_password');
  
  // หา row ของ target user
  for (let i = 1; i < data.length; i++) {
    if (data[i][colUserId] == targetUserId) {
      // สร้างรหัสชั่วคราว
      const tempPassword = generateTempPassword();
      const newHash = hashPassword(tempPassword, null);
      
      // อัปเดต
      sheet.getRange(i + 1, colPasswordHash + 1).setValue(newHash);
      sheet.getRange(i + 1, colMustChange + 1).setValue(true);
      
      return { 
        success: true, 
        message: 'รีเซ็ตรหัสผ่านสำเร็จ',
        tempPassword: tempPassword // ส่งคืนให้ admin แจ้งผู้ใช้
      };
    }
  }
  
  return { success: false, error: 'ไม่พบ user_id นี้' };
}

// ====================================================
// UTILITY FUNCTIONS
// ====================================================

/**
 * ดึง sheet จาก spreadsheet
 */
function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('ไม่พบ sheet: ' + sheetName);
  }
  
  return sheet;
}

// ====================================================
// HELPER FUNCTION FOR TESTING
// ====================================================

/**
 * สร้าง hash สำหรับ password ใหม่ (ใช้ตอน setup)
 * รันใน Apps Script Editor เพื่อสร้าง hash
 */
function createPasswordHash(password) {
  const hash = hashPassword(password, null);
  Logger.log('Password hash for "' + password + '": ' + hash);
  return hash;
}

/**
 * Test function - ลองสร้าง hash
 */
function testHash() {
  createPasswordHash('test1234');
}
