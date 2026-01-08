/**
 * ====================================================
 * Admin Module - Health Tracker
 * ====================================================
 * จัดการหน้า Admin - รายชื่อผู้ใช้และ Reset Password
 */

// ====================================================
// LOAD USERS
// ====================================================

/**
 * โหลดรายชื่อผู้ใช้ทั้งหมด
 */
async function loadUsers() {
    showLoading(true);

    try {
        const token = getToken();
        const result = await callAPI('adminGetUsers', { token });

        if (result.success) {
            renderUsersTable(result.users);
        } else {
            if (result.error && result.error.includes('Session')) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Session หมดอายุ',
                    text: 'กรุณาเข้าสู่ระบบใหม่',
                    confirmButtonColor: '#667eea'
                }).then(() => {
                    clearSession();
                    window.location.href = 'login.html';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: result.error || 'ไม่สามารถโหลดข้อมูลได้',
                    confirmButtonColor: '#667eea'
                });
            }
        }
    } catch (error) {
        console.error('Load users error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
            confirmButtonColor: '#667eea'
        });
    } finally {
        showLoading(false);
    }
}

// ====================================================
// RENDER USERS TABLE
// ====================================================

/**
 * Render ตารางผู้ใช้
 * @param {Array} users 
 */
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!users || users.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('d-none');
        return;
    }

    emptyState.classList.add('d-none');

    tbody.innerHTML = users.map(user => `
        <tr>
            <td><code>${escapeHtml(user.userId)}</code></td>
            <td>
                <i class="bi bi-person-circle me-1"></i>
                ${escapeHtml(user.username)}
            </td>
            <td>
                ${user.role === 'admin'
            ? '<span class="badge bg-warning text-dark"><i class="bi bi-shield-fill"></i> Admin</span>'
            : '<span class="badge bg-secondary"><i class="bi bi-person-fill"></i> User</span>'
        }
            </td>
            <td>
                ${user.mustChangePassword
            ? '<span class="badge bg-danger"><i class="bi bi-exclamation-triangle"></i> ต้องเปลี่ยน</span>'
            : '<span class="badge bg-success"><i class="bi bi-check-circle"></i> ปกติ</span>'
        }
            </td>
            <td>
                <button 
                    class="btn btn-outline-warning btn-sm" 
                    onclick="resetPassword('${escapeHtml(user.userId)}', '${escapeHtml(user.username)}')"
                    ${user.role === 'admin' ? 'disabled title="ไม่สามารถรีเซ็ตรหัส Admin ได้"' : ''}
                >
                    <i class="bi bi-key-fill"></i> รีเซ็ตรหัส
                </button>
            </td>
        </tr>
    `).join('');
}

// ====================================================
// RESET PASSWORD
// ====================================================

/**
 * Reset password ของผู้ใช้
 * @param {string} userId 
 * @param {string} username 
 */
async function resetPassword(userId, username) {
    const result = await Swal.fire({
        title: 'รีเซ็ตรหัสผ่าน?',
        html: `
            <p>คุณต้องการรีเซ็ตรหัสผ่านของ <strong>${escapeHtml(username)}</strong>?</p>
            <p class="text-muted small">ระบบจะสร้างรหัสผ่านชั่วคราวให้</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ffc107',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="bi bi-key-fill"></i> รีเซ็ตรหัสผ่าน',
        cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) {
        return;
    }

    try {
        Swal.fire({
            title: 'กำลังรีเซ็ตรหัสผ่าน...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const token = getToken();
        const response = await callAPI('adminResetPassword', { token, targetUserId: userId });

        if (response.success) {
            await Swal.fire({
                icon: 'success',
                title: 'รีเซ็ตรหัสผ่านสำเร็จ',
                html: `
                    <p>รหัสผ่านชั่วคราวสำหรับ <strong>${escapeHtml(username)}</strong>:</p>
                    <div class="alert alert-warning">
                        <h4 class="mb-0"><code>${escapeHtml(response.tempPassword)}</code></h4>
                    </div>
                    <p class="text-danger small">
                        <i class="bi bi-exclamation-triangle"></i> 
                        โปรดบันทึกรหัสผ่านนี้และแจ้งผู้ใช้ทันที
                    </p>
                `,
                confirmButtonColor: '#667eea'
            });

            // Reload users table
            await loadUsers();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: response.error || 'ไม่สามารถรีเซ็ตรหัสผ่านได้',
                confirmButtonColor: '#667eea'
            });
        }
    } catch (error) {
        console.error('Reset password error:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
            confirmButtonColor: '#667eea'
        });
    }
}

// ====================================================
// UTILITY FUNCTIONS
// ====================================================

/**
 * Show/hide loading overlay
 * @param {boolean} show 
 */
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text 
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
