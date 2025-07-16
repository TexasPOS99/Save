class EmailCustomerSystem {
    constructor() {
        this.emails = this.loadFromStorage();
        this.currentEditingRow = null;
        this.initializeEventListeners();
        this.renderTable();
    }

    initializeEventListeners() {
        // Add email button
        document.getElementById('addEmailBtn').addEventListener('click', () => {
            this.addEmail();
        });

        // Enter key on input
        document.getElementById('emailSuffix').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addEmail();
            }
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveData();
        });

        // Clear all button
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAll();
        });

        // Modal events
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('saveAppsBtn').addEventListener('click', () => {
            this.saveApps();
        });

        // Close modal when clicking outside
        document.getElementById('appModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('appModal')) {
                this.closeModal();
            }
        });
    }

    addEmail() {
        const suffixInput = document.getElementById('emailSuffix');
        const suffix = suffixInput.value.trim();

        if (!suffix) {
            alert('กรุณากรอกส่วนท้ายของอีเมล');
            return;
        }

        // Check if email already exists
        const fullEmail = `normalshop${suffix}@gmail.com`;
        if (this.emails.find(email => email.email === fullEmail)) {
            alert('อีเมลนี้มีอยู่ในระบบแล้ว');
            return;
        }

        const newEmail = {
            id: Date.now(),
            email: fullEmail,
            date: this.formatDate(new Date()),
            status: false, // false = ❌, true = ✅
            apps: {
                shopee: '⚪️',
                lazada: '⚪️',
                tiktok: '⚪️',
                chatgpt: '⚪️',
                gemini: '⚪️'
            },
            notes: ''
        };

        this.emails.push(newEmail);
        this.saveToStorage();
        this.renderTable();
        suffixInput.value = '';
    }

    formatDate(date) {
        const months = [
            'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
        ];
        
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = (date.getFullYear() + 543).toString().slice(-2);
        
        return `${day} ${month} ${year}`;
    }

    renderTable() {
        const tbody = document.getElementById('emailTableBody');
        
        if (this.emails.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <div class="empty-state-icon">📧</div>
                        <div class="empty-state-text">ยังไม่มีข้อมูลอีเมล<br>เพิ่มอีเมลแรกของคุณเลย!</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.emails.map(email => `
            <tr>
                <td class="email-cell">${email.email.replace('@gmail.com', '')}</td>
                <td class="date-cell">${email.date}</td>
                <td>
                    <button class="status-toggle ${email.status ? 'status-active' : 'status-inactive'}" 
                            onclick="emailSystem.toggleStatus(${email.id})">
                        ${email.status ? '✅' : '❌'}
                    </button>
                </td>
                <td class="apps-cell" onclick="emailSystem.openAppModal(${email.id})">
                    ${this.renderAppsDisplay(email.apps)}
                </td>
                <td>
                    <textarea class="notes-input" 
                              placeholder="หมายเหตุ..."
                              onchange="emailSystem.updateNotes(${email.id}, this.value)">${email.notes}</textarea>
                </td>
                <td class="manage-cell">
                    <button class="delete-btn" onclick="emailSystem.deleteEmail(${email.id})" title="ลบรายการนี้">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderAppsDisplay(apps) {
        const activeApps = Object.entries(apps).filter(([app, status]) => status !== '⚪️');
        
        if (activeApps.length === 0) {
            return '<div style="color: #a0aec0; font-size: 12px;">คลิกเพื่อเลือกแอป</div>';
        }

        return `
            <div class="apps-display">
                ${activeApps.map(([app, status]) => `
                    <div class="app-status-item">
                        <span>${this.getAppDisplayName(app)}</span>
                        <span class="${this.getStatusClass(status)}">${status}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getAppDisplayName(app) {
        const names = {
            shopee: 'Shopee',
            lazada: 'Lazada',
            tiktok: 'Tiktok',
            chatgpt: 'ChatGPT',
            gemini: 'Gemini'
        };
        return names[app] || app;
    }

    getStatusClass(status) {
        switch (status) {
            case '✅': return 'status-active';
            case '❌': return 'status-inactive';
            case '⚪️': return 'status-unused';
            default: return '';
        }
    }

    toggleStatus(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (email) {
            email.status = !email.status;
            this.saveToStorage();
            this.renderTable();
        }
    }

    openAppModal(emailId) {
        this.currentEditingRow = emailId;
        const email = this.emails.find(e => e.id === emailId);
        
        if (email) {
            // Set current app statuses in modal
            Object.entries(email.apps).forEach(([app, status]) => {
                const select = document.querySelector(`[data-app="${app}"]`);
                if (select) {
                    select.value = status;
                }
            });
            
            document.getElementById('appModal').style.display = 'block';
        }
    }

    closeModal() {
        document.getElementById('appModal').style.display = 'none';
        this.currentEditingRow = null;
    }

    saveApps() {
        if (!this.currentEditingRow) return;

        const email = this.emails.find(e => e.id === this.currentEditingRow);
        if (email) {
            // Get all app statuses from modal
            const appSelects = document.querySelectorAll('.app-status');
            appSelects.forEach(select => {
                const app = select.getAttribute('data-app');
                email.apps[app] = select.value;
            });

            this.saveToStorage();
            this.renderTable();
            this.closeModal();
        }
    }

    updateNotes(emailId, notes) {
        const email = this.emails.find(e => e.id === emailId);
        if (email) {
            email.notes = notes;
            this.saveToStorage();
        }
    }

    deleteEmail(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        if (email && confirm(`คุณต้องการลบอีเมล "${email.email.replace('@gmail.com', '')}" หรือไม่?`)) {
            this.emails = this.emails.filter(e => e.id !== emailId);
            this.saveToStorage();
            this.renderTable();
        }
    }

    saveData() {
        // Data is already saved automatically, just show confirmation
        const originalText = document.getElementById('saveBtn').textContent;
        document.getElementById('saveBtn').textContent = '✅ บันทึกแล้ว';
        document.getElementById('saveBtn').style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        
        setTimeout(() => {
            document.getElementById('saveBtn').textContent = originalText;
            document.getElementById('saveBtn').style.background = 'linear-gradient(135deg, #4299e1, #3182ce)';
        }, 2000);
    }

    clearAll() {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด?')) {
            this.emails = [];
            this.saveToStorage();
            this.renderTable();
        }
    }

    saveToStorage() {
        localStorage.setItem('emailCustomerData', JSON.stringify(this.emails));
    }

    loadFromStorage() {
        const data = localStorage.getItem('emailCustomerData');
        return data ? JSON.parse(data) : [];
    }
}

// Initialize the system when page loads
let emailSystem;
document.addEventListener('DOMContentLoaded', () => {
    emailSystem = new EmailCustomerSystem();
});