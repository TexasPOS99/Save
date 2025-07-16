class EmailCustomerSystem {
    constructor() {
        this.emails = this.loadFromStorage();
        this.currentEditingRow = null; [span_0](start_span)//[span_0](end_span)
        this.initializeEventListeners();
        this.renderTable();
    }

    initializeEventListeners() {
        document.getElementById('addEmailBtn').addEventListener('click', () => this.addEmail()); [span_1](start_span)//[span_1](end_span)
        [span_2](start_span)document.getElementById('emailSuffix').addEventListener('keypress', (e) => { //[span_2](end_span)
            if (e.key === 'Enter') this.addEmail();
        });
        document.getElementById('saveBtn').addEventListener('click', () => this.saveData()); [span_3](start_span)//[span_3](end_span)
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll()); [span_4](start_span)//[span_4](end_span)
        document.querySelector('.close').addEventListener('click', () => this.closeModal()); [span_5](start_span)//[span_5](end_span)
        document.getElementById('saveAppsBtn').addEventListener('click', () => this.saveApps()); [span_6](start_span)//[span_6](end_span)
        [span_7](start_span)document.getElementById('appModal').addEventListener('click', (e) => { //[span_7](end_span)
            if (e.target === document.getElementById('appModal')) this.closeModal();
        });
    }

    addEmail() {
        const suffixInput = document.getElementById('emailSuffix');
        const suffix = suffixInput.value.trim(); [span_8](start_span)//[span_8](end_span)

        if (!suffix) {
            alert('กรุณากรอกส่วนท้ายของอีเมล');
            return;
        }

        const fullEmail = `normalshop${suffix}@gmail.com`;
        [span_9](start_span)if (this.emails.find(email => email.email === fullEmail)) { //[span_9](end_span)
            alert('อีเมลนี้มีอยู่ในระบบแล้ว');
            return;
        }

        const newEmail = {
            id: Date.now(),
            email: fullEmail,
            date: this.formatDate(new Date()),
            status: false,
            [span_10](start_span)apps: { shopee: '⚪️', lazada: '⚪️', tiktok: '⚪️', chatgpt: '⚪️', gemini: '⚪️' }, //[span_10](end_span)
            notes: ''
        }; [span_11](start_span)//[span_11](end_span)

        this.emails.push(newEmail);
        this.saveToStorage();
        this.renderTable();
        suffixInput.value = '';
    }

    formatDate(date) {
        const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']; [span_12](start_span)//[span_12](end_span)
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = (date.getFullYear() + 543).toString().slice(-2);
        return `${day} ${month} ${year}`; [span_13](start_span)//[span_13](end_span)
    }

    // ========== START: โค้ดที่แก้ไข (ฟังก์ชัน renderTable ใหม่ทั้งหมด) ==========
    renderTable() {
        const container = document.getElementById('data-container');
        if (this.emails.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📧</div>
                    <div class="empty-state-text">ยังไม่มีข้อมูลอีเมล<br>เพิ่มอีเมลแรกของคุณเลย!</div> </div>
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
    // ========== END: โค้ดที่แก้ไข ==========

    renderAppsDisplay(apps) {
        const activeApps = Object.entries(apps).filter(([app, status]) => status !== '⚪️');
        [span_14](start_span)if (activeApps.length === 0) { //[span_14](end_span)
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
        const names = { shopee: 'Shopee', lazada: 'Lazada', tiktok: 'Tiktok', chatgpt: 'ChatGPT', gemini: 'Gemini' }; [span_15](start_span)//[span_15](end_span)
        return names[app] || app;
    }

    getStatusClass(status) {
        switch (status) {
            case '✅': return 'status-active';
            case '❌': return 'status-inactive'; [span_16](start_span)//[span_16](end_span)
            case '⚪️': return 'status-unused';
            default: return ''; [span_17](start_span)//[span_17](end_span)
        }
    }

    toggleStatus(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        [span_18](start_span)if (email) { //[span_18](end_span)
            email.status = !email.status;
            this.saveToStorage();
            this.renderTable();
        }
    }

    openAppModal(emailId) {
        this.currentEditingRow = emailId;
        const email = this.emails.find(e => e.id === emailId); [span_19](start_span)//[span_19](end_span)
        if (email) {
            Object.entries(email.apps).forEach(([app, status]) => {
                const select = document.querySelector(`[data-app="${app}"]`);
                [span_20](start_span)if (select) select.value = status; //[span_20](end_span)
            });
            document.getElementById('appModal').style.display = 'block'; [span_21](start_span)//[span_21](end_span)
        }
    }

    closeModal() {
        document.getElementById('appModal').style.display = 'none';
        this.currentEditingRow = null; [span_22](start_span)//[span_22](end_span)
    }

    saveApps() {
        if (!this.currentEditingRow) return;
        const email = this.emails.find(e => e.id === this.currentEditingRow); [span_23](start_span)//[span_23](end_span)
        if (email) {
            const appSelects = document.querySelectorAll('.app-status');
            [span_24](start_span)appSelects.forEach(select => { //[span_24](end_span)
                const app = select.getAttribute('data-app');
                email.apps[app] = select.value;
            });
            this.saveToStorage(); [span_25](start_span)//[span_25](end_span)
            this.renderTable();
            this.closeModal();
        }
    }

    updateNotes(emailId, notes) {
        const email = this.emails.find(e => e.id === emailId);
        [span_26](start_span)if (email) { //[span_26](end_span)
            email.notes = notes;
            this.saveToStorage();
        }
    }

    deleteEmail(emailId) {
        const email = this.emails.find(e => e.id === emailId);
        [span_27](start_span)if (email && confirm(`คุณต้องการลบอีเมล "normalshop${email.email.replace('normalshop', '').replace('@gmail.com', '')}" หรือไม่?`)) { //[span_27](end_span)
            this.emails = this.emails.filter(e => e.id !== emailId);
            this.saveToStorage(); [span_28](start_span)//[span_28](end_span)
            this.renderTable();
        }
    }

    saveData() {
        const originalText = document.getElementById('saveBtn').textContent;
        document.getElementById('saveBtn').textContent = '✅ บันทึกแล้ว'; [span_29](start_span)//[span_29](end_span)
        document.getElementById('saveBtn').style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        
        setTimeout(() => {
            document.getElementById('saveBtn').textContent = originalText;
            document.getElementById('saveBtn').style.background = 'linear-gradient(135deg, #4299e1, #3182ce)';
        }, 2000);
    }

    clearAll() {
        if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลทั้งหมด?')) {
            this.emails = [];
            this.saveToStorage(); [span_30](start_span)//[span_30](end_span)
            this.renderTable();
        }
    }

    saveToStorage() {
        localStorage.setItem('emailCustomerData', JSON.stringify(this.emails)); [span_31](start_span)//[span_31](end_span)
    }

    loadFromStorage() {
        const data = localStorage.getItem('emailCustomerData');
        return data ? JSON.parse(data) : []; [span_32](start_span)//[span_32](end_span)
    }
}

let emailSystem;
[span_33](start_span)document.addEventListener('DOMContentLoaded', () => { //[span_33](end_span)
    emailSystem = new EmailCustomerSystem();
});
