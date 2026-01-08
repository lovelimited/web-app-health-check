# Health Tracker - ระบบติดตามสุขภาพรายบุคคล

ระบบ Web Application สำหรับติดตามสุขภาพรายบุคคล รองรับผู้ใช้งาน ~200 คน ใช้งานได้ในระดับโรงเรียน/หน่วยงาน

## 📋 Features

- ✅ **Dashboard** - แสดงกราฟสุขภาพ 5 ประเภท (น้ำหนัก, BMI, ความดันโลหิต, SpO2, น้ำตาลในเลือด)
- ✅ **Authentication** - ระบบ Login พร้อม SHA-256 password hashing
- ✅ **Session Management** - Token-based authentication ด้วย CacheService
- ✅ **Admin Panel** - จัดการผู้ใช้และ Reset Password
- ✅ **PWA Support** - ติดตั้งเป็น App บนมือถือได้
- ✅ **Responsive Design** - รองรับทุกขนาดหน้าจอ

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5
- Chart.js
- SweetAlert2
- PWA (Progressive Web App)

### Backend
- Google Apps Script (GAS)
- Google Sheets (Database)

## 📁 Project Structure

```
/
├── index.html              # Redirect page
├── login.html              # Login page
├── dashboard.html          # Main dashboard with charts
├── change_password.html    # Change password page
├── admin.html              # Admin panel
├── css/
│   └── style.css           # Stylesheet
├── js/
│   ├── api.js              # API communication
│   ├── auth.js             # Authentication
│   ├── charts.js           # Chart.js configuration
│   ├── admin.js            # Admin functions
│   └── pwa.js              # PWA registration
├── icons/
│   ├── icon-192x192.png    # PWA icon
│   └── icon-512x512.png    # PWA icon
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker
└── gas/
    └── Code.gs             # Google Apps Script backend
```

## 🚀 Deployment Guide

### Step 1: Setup Google Sheets

1. สร้าง Google Sheets ใหม่
2. สร้าง 5 Sheets ตามโครงสร้างนี้:

**Sheet: user**
| user_id | username | password_hash | role | must_change_password |
|---------|----------|---------------|------|---------------------|
| 1       | admin    | [hash]        | admin| FALSE               |
| 2       | user1    | [hash]        | user | FALSE               |

**Sheet: น้ำหนัก-ส่วนสูง-bmi**
| user_id | date | weight | height | bmi |
|---------|------|--------|--------|-----|

**Sheet: ความดันโลหิต**
| user_id | date | sys | dia | pul | status |
|---------|------|-----|-----|-----|--------|

**Sheet: O2ในเลือด**
| user_id | date | spo2 |
|---------|------|------|

**Sheet: น้ำตาลในเลือด**
| user_id | date | sugar |
|---------|------|-------|

### Step 2: Deploy Google Apps Script

1. เปิด Google Sheets → Extensions → Apps Script
2. คัดลอกโค้ดจาก `gas/Code.gs` ทั้งหมด
3. เปลี่ยน `SPREADSHEET_ID` เป็น ID ของ Google Sheets
4. Deploy → New deployment → Web app
5. Execute as: Me
6. Who has access: Anyone
7. คัดลอก Web app URL

### Step 3: Configure Frontend

1. เปิดไฟล์ `js/api.js`
2. เปลี่ยน `API_URL` เป็น Web app URL จาก Step 2

```javascript
const API_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

### Step 4: Deploy to GitHub Pages

1. สร้าง GitHub Repository ใหม่
2. Push โค้ดทั้งหมด (ยกเว้นโฟลเดอร์ `gas/`)
3. Settings → Pages → Source: Deploy from branch
4. เลือก branch `main` และ folder `/ (root)`
5. รอ Deploy เสร็จ

### Step 5: Create Admin Password

ใน Apps Script Editor รันฟังก์ชัน:

```javascript
function testHash() {
  createPasswordHash('your_admin_password');
}
```

คัดลอก hash ที่ได้ไปใส่ในคอลัมน์ `password_hash` ของ admin user

## 🔐 Security Features

- ✅ SHA-256 password hashing with random salt
- ✅ Session token via CacheService (30 นาที)
- ✅ Token → user_id lookup (ไม่รับ user_id จาก frontend)
- ✅ Role-based access control
- ✅ sessionStorage (ไม่ใช้ localStorage)
- ✅ Forced password change after admin reset

## 📊 API Endpoints

| Action | Description | Auth Required |
|--------|-------------|---------------|
| `login` | เข้าสู่ระบบ | ❌ |
| `logout` | ออกจากระบบ | ✅ |
| `getMyProfile` | ดึงข้อมูลโปรไฟล์ | ✅ |
| `getMyTimeline` | ดึงข้อมูลสุขภาพ | ✅ |
| `changePassword` | เปลี่ยนรหัสผ่าน | ✅ |
| `adminGetUsers` | ดูรายชื่อผู้ใช้ | ✅ (Admin) |
| `adminResetPassword` | รีเซ็ตรหัสผู้ใช้ | ✅ (Admin) |

## 📱 PWA Installation

1. เปิดเว็บไซต์ใน Chrome/Safari
2. คลิก "Add to Home Screen" หรือ "Install"
3. App จะถูกติดตั้งบนมือถือ

## 🔧 Troubleshooting

### ปัญหา: Login ไม่ได้
- ตรวจสอบ `API_URL` ใน `js/api.js`
- ตรวจสอบว่า Deploy web app เป็น "Anyone" access

### ปัญหา: ข้อมูลไม่แสดง
- ตรวจสอบ `SPREADSHEET_ID` ใน `Code.gs`
- ตรวจสอบชื่อ Sheet ตรงกับที่กำหนด

### ปัญหา: Session หมดอายุเร็ว
- แก้ไข `TOKEN_EXPIRY_SECONDS` ใน `Code.gs`

## 📝 License

MIT License - Free to use

## 👥 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ กรุณาติดต่อผู้ดูแลระบบ
