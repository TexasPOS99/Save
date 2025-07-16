class EmailCustomerSystem {
    constructor() {
        this.emails = this.loadFromStorage();
        this.currentEditingRow = null;
        this.initializeEventListeners();
        this.renderTable();
    }

    initializeEventListeners() {
        document.getElementById('addEmailBtn').addEventListener('click', () => this.addEmail());
        document.getElementById('emailSuffix').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addEmail();
        });
        document.getElementById('saveBtn').addEventListener('click', () => this.saveData());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('saveAppsBtn').addEventListener('click', () => this.saveApps());
        document.getElementById('appModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('appModal')) this.closeModal();
        });
    }

    addEmail() {
        const suffixInput = document.getElementById('emailSuffix');
        const suffix = suffixInput.value.trim();

        if (!suffix) {
            alert('กรุณากรอกส่วนท้ายของอีเมล');
            return;
        }

        const fullEmail = `normalshop${suffix}@gmail.com`;
        if (this.emails.find(email => email.email === fullEmail)) {
            alert('อีเมลนี้มีอยู่ในระบบแล้ว');
            return;
        }

        const newEmail = {
            id: Date.now(),
            email: fullEmail,
            date: this.formatDate(new Date()),
            status: false,
            apps: { shopee: '⚪️', lazada: '⚪️', tiktok: '⚪️', chatgpt: '⚪️', gemini: '⚪️' },
            notes: ''
        };

        this.emails.push(newEmail);
        this.saveToStorage();
        this.renderTable();
        suffixInput.value = '';
    }

    formatDate(date) {
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = (date.getFullYear() + 543).toString().slice(-2);
        return `${day} ${month} ${year}`;
    }

    renderTable() {
        // ========== START: โค้ดที่แก้ไข ==========
        const container = document.getElementById('email-list-container');
        
        // เพิ่มการตรวจสอบว่าหา container เจอหรือไม่
        if (!container) {
            console.error('Error: ไม่พบ Element ที่มี ID "email-list-container"');
            return;
        }
        // ========== END: โค้ดที่แก้ไข ==========

        if (this.emails.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📧</div>
                    <div class="empty-state-text">ยังไม่มีข้อมูลอีเมล<br>เพิ่มอีเมลแรกของคุณเลย!</div>
                </div>
            `;
            return;
        }

        container.innerHTML = this.emails.map(email => {
            const emailSuffix = email.email.replace('normalshop', '').replace('@gmail.com', '');
            
            return `
            <div class="email-card">
                <div class="card-header">
                    <div class="email-identifier">
                        <span class="email-prefix-label">normalshop</span>
                        <span class="email-suffix-display">${emailSuffix}</span>
                    </div>
                    <div class="header-actions">
                        <button class="status-toggle ${email.status ? 'status-active' : 'status-inactive'}" 
                                onclick="emailSystem.toggleStatus(${email.id})">
                            ${email.status ? '✅' : '❌'}
                        </button>
                        <button class="delete-btn" onclick="emailSystem.deleteEmail(${email.id})" title="ลบรายการนี้">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-row">
                        <span class="label">วันที่สมัคร:</span>
                        <span class="value date-value">${email.date}</span>
                    </div>
                    <div class="card-row">
                        <span class="label">แอปที่ลงทะเบียน:</span>
                        <div class="value apps-cell" onclick="emailSystem.openAppModal(${email.id})">
                            ${this.renderAppsDisplay(email.apps)}
                        </div>
                    </div>
                    <div class="card-row notes-row">
                         <span class="label">หมายเหตุ:</span>
                         <textarea class="notes-input" 
                                   placeholder="เพิ่มหมายเหตุ..."
                                   onchange="emailSystem.updateNotes(${email.id}, this.value)">${email.notes}</textarea>
                    </div>
                </div>
            </div>
            `;
        }).join('');
    }

    renderAppsDisplay(apps) {
        const activeApps = Object.entries(apps).filter(([app, status]) => status !== '⚪️');
        if (activeApps.length === 0) {
            return '<span class="placeholder-text">คลิกเพื่อเลือกแอป</span>';
        }

        return `
            <div class="apps-display-grid">
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
        const names = { shopee: 'Shopee', lazada: 'Lazada', tiktok: 'Tiktok', chatgpt: 'ChatGPT', gemini: 'Gemini' };
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
            Object.entries(email.apps).forEach(([app, status]) => {
                const select = document.querySelector(`[data-app="${app}"]`);
                if (select) select.value = status;
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
        if (email && confirm(`คุณต้องการลบอีเมล "normalshop${email.email.replace('normalshop', '').replace('@gmail.com', '')}" หรือไม่?`)) {
            this.emails = this.emails.filter(e => e.id !== emailId);
            this.saveToStorage();
            this.renderTable();
        }
    }

    saveData() {
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

let emailSystem;
document.addEventListener('DOMContentLoaded', () => {
    emailSystem = new EmailCustomerSystem();
});
