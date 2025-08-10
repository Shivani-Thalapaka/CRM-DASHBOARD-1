// Global variables
let currentUser = null;
let currentEditId = null;
let currentEditType = null;

// API Base URL
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
});

// Check if user is authenticated
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');
    
    if (token && userEmail) {
        currentUser = { email: userEmail };
        showDashboard();
    } else {
        showLogin();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Modal forms
    document.getElementById('customerForm').addEventListener('submit', handleCustomerSubmit);
    document.getElementById('leadForm').addEventListener('submit', handleLeadSubmit);
    document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);
    document.getElementById('stageForm').addEventListener('submit', handleStageSubmit);
    
    // Communication forms
    const emailForm = document.getElementById('emailForm');
    const smsForm = document.getElementById('smsForm');
    const callForm = document.getElementById('callForm');
    
    if (emailForm) emailForm.addEventListener('submit', handleEmailSubmit);
    if (smsForm) smsForm.addEventListener('submit', handleSMSSubmit);
    if (callForm) callForm.addEventListener('submit', handleCallSubmit);
    
    // Close modal on overlay click
    document.getElementById('modalOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const button = e.target.querySelector('button[type="submit"]');
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.loading-spinner');
    
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    button.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.email || email);
            currentUser = { email: data.email || email };
            showDashboard();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage(`Login failed: ${error.message}`, 'error');
    } finally {
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
        button.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    const button = e.target.querySelector('button[type="submit"]');
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.loading-spinner');
    
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    button.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Registration successful! Please login.', 'success');
            showLogin();
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showMessage(`Registration failed: ${error.message}`, 'error');
    } finally {
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
        button.disabled = false;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    currentUser = null;
    showLogin();
    showMessage('Logged out successfully.', 'success');
}

// Page navigation
function showLogin() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('registerPage').classList.remove('active');
    document.getElementById('dashboard').classList.remove('active');
}

function showRegister() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('registerPage').classList.add('active');
    document.getElementById('dashboard').classList.remove('active');
}

function showDashboard() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('registerPage').classList.remove('active');
    document.getElementById('dashboard').classList.add('active');
    
    if (currentUser) {
        document.getElementById('userEmail').textContent = currentUser.email;
        loadDashboardData();
    }
}

// Tab management
function showTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    event.target.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Load data for the active tab
    switch(tabName) {
        case 'customers':
            loadCustomers();
            break;
        case 'leads':
            loadLeads();
            break;
        case 'contacts':
            loadContacts();
            break;
        case 'stages':
            loadStages();
            break;
        case 'communication':
            loadCommunicationHistory();
            break;
    }
}

// Load dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadCustomers(),
        loadLeads(),
        loadContacts(),
        loadStages()
    ]);
    updateStats();
}

// Update dashboard stats
function updateStats() {
    const customersCount = document.querySelectorAll('#customersTable tbody tr').length;
    const leadsCount = document.querySelectorAll('#leadsTable tbody tr').length;
    const contactsCount = document.querySelectorAll('#contactsTable tbody tr').length;
    const stagesCount = document.querySelectorAll('#stagesTable tbody tr').length;
    
    document.getElementById('totalCustomers').textContent = customersCount;
    document.getElementById('totalLeads').textContent = leadsCount;
    document.getElementById('totalContacts').textContent = contactsCount;
    document.getElementById('totalStages').textContent = stagesCount;
}

// API helper function
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, finalOptions);
        
        if (response.status === 401 || response.status === 403) {
            logout();
            return null;
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP ${response.status}: ${response.statusText}` }));
            showMessage(errorData.message || `Request failed: ${response.status}`, 'error');
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API request failed:', error);
        showMessage(`Network error: ${error.message}`, 'error');
        return null;
    }
}

// Customer functions
async function loadCustomers() {
    const response = await apiRequest('/customers');
    if (response && response.success) {
        displayCustomers(response.data);
    }
}

function displayCustomers(customers) {
    const tbody = document.querySelector('#customersTable tbody');
    tbody.innerHTML = '';
    
    customers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.company || '-'}</td>
            <td>${customer.address || '-'}</td>
            <td>
                <button class="btn-edit" onclick="editCustomer(${customer.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteCustomer(${customer.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    updateStats();
}

function showAddCustomerModal() {
    currentEditId = null;
    currentEditType = 'customer';
    document.getElementById('customerModalTitle').textContent = 'Add Customer';
    document.getElementById('customerForm').reset();
    showModal('customerModal');
}

async function editCustomer(id) {
    currentEditId = id;
    currentEditType = 'customer';
    document.getElementById('customerModalTitle').textContent = 'Edit Customer';
    
    const response = await apiRequest(`/customers/${id}`);
    if (response && response.success) {
        const customer = response.data;
        document.getElementById('customerName').value = customer.name || '';
        document.getElementById('customerEmail').value = customer.email || '';
        document.getElementById('customerPhone').value = customer.phone || '';
        document.getElementById('customerCompany').value = customer.company || '';
        document.getElementById('customerAddress').value = customer.address || '';
    }
    
    showModal('customerModal');
}

async function handleCustomerSubmit(e) {
    e.preventDefault();
    
    const customerData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        company: document.getElementById('customerCompany').value,
        address: document.getElementById('customerAddress').value
    };
    
    const endpoint = currentEditId ? `/customers/${currentEditId}` : '/customers';
    const method = currentEditId ? 'PUT' : 'POST';
    
    const result = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(customerData)
    });
    
    if (result && result.success) {
        closeModal();
        loadCustomers();
        showMessage(currentEditId ? 'Customer updated successfully!' : 'Customer added successfully!', 'success');
    }
}

async function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
        const result = await apiRequest(`/customers/${id}`, { method: 'DELETE' });
        if (result && result.success) {
            loadCustomers();
            showMessage('Customer deleted successfully!', 'success');
        }
    }
}

// Lead functions
async function loadLeads() {
    const response = await apiRequest('/leads');
    if (response && response.success) {
        displayLeads(response.data);
    }
}

function displayLeads(leads) {
    const tbody = document.querySelector('#leadsTable tbody');
    tbody.innerHTML = '';
    
    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${lead.customer_name || 'N/A'}</td>
            <td>${lead.lead_source}</td>
            <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
            <td>$${parseFloat(lead.value || 0).toLocaleString()}</td>
            <td>
                <button class="btn-edit" onclick="editLead(${lead.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteLead(${lead.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    updateStats();
}

async function showAddLeadModal() {
    currentEditId = null;
    currentEditType = 'lead';
    document.getElementById('leadModalTitle').textContent = 'Add Lead';
    document.getElementById('leadForm').reset();
    
    await loadCustomersDropdown('leadCustomer');
    showModal('leadModal');
}

async function loadCustomersDropdown(selectId) {
    const response = await apiRequest('/customers');
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Customer</option>';
    
    if (response && response.success) {
        response.data.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = customer.name;
            select.appendChild(option);
        });
    }
}

async function handleLeadSubmit(e) {
    e.preventDefault();
    
    const leadData = {
        customer_id: document.getElementById('leadCustomer').value,
        lead_source: document.getElementById('leadSource').value,
        status: document.getElementById('leadStatus').value,
        value: document.getElementById('leadValue').value,
        description: document.getElementById('leadDescription').value
    };
    
    const endpoint = currentEditId ? `/leads/${currentEditId}` : '/leads';
    const method = currentEditId ? 'PUT' : 'POST';
    
    const result = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(leadData)
    });
    
    if (result && result.success) {
        closeModal();
        loadLeads();
        showMessage(currentEditId ? 'Lead updated successfully!' : 'Lead added successfully!', 'success');
    }
}

async function deleteLead(id) {
    if (confirm('Are you sure you want to delete this lead?')) {
        const result = await apiRequest(`/leads/${id}`, { method: 'DELETE' });
        if (result && result.success) {
            loadLeads();
            showMessage('Lead deleted successfully!', 'success');
        }
    }
}

// Contact functions
async function loadContacts() {
    const response = await apiRequest('/contacts');
    if (response && response.success) {
        displayContacts(response.data);
    }
}

function displayContacts(contacts) {
    const tbody = document.querySelector('#contactsTable tbody');
    tbody.innerHTML = '';
    
    contacts.forEach(contact => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${contact.customer_name}</td>
            <td>${contact.contact_type}</td>
            <td>${contact.contact_value}</td>
            <td>${contact.is_primary ? 'Yes' : 'No'}</td>
            <td>
                <button class="btn-edit" onclick="editContact(${contact.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteContact(${contact.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    updateStats();
}

async function showAddContactModal() {
    currentEditId = null;
    currentEditType = 'contact';
    document.getElementById('contactModalTitle').textContent = 'Add Contact';
    document.getElementById('contactForm').reset();
    
    await loadCustomersDropdown('contactCustomer');
    showModal('contactModal');
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const contactData = {
        customer_id: document.getElementById('contactCustomer').value,
        contact_type: document.getElementById('contactType').value,
        contact_value: document.getElementById('contactValue').value,
        is_primary: document.getElementById('contactPrimary').checked
    };
    
    const endpoint = currentEditId ? `/contacts/${currentEditId}` : '/contacts';
    const method = currentEditId ? 'PUT' : 'POST';
    
    const result = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(contactData)
    });
    
    if (result && result.success) {
        closeModal();
        loadContacts();
        showMessage(currentEditId ? 'Contact updated successfully!' : 'Contact added successfully!', 'success');
    }
}

async function deleteContact(id) {
    if (confirm('Are you sure you want to delete this contact?')) {
        const result = await apiRequest(`/contacts/${id}`, { method: 'DELETE' });
        if (result && result.success) {
            loadContacts();
            showMessage('Contact deleted successfully!', 'success');
        }
    }
}

// Stage functions
async function loadStages() {
    const response = await apiRequest('/stages');
    if (response && response.success) {
        displayStages(response.data);
    }
}

function displayStages(stages) {
    const tbody = document.querySelector('#stagesTable tbody');
    tbody.innerHTML = '';
    
    stages.forEach(stage => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stage.lead_id}</td>
            <td>${stage.customer_name || '-'}</td>
            <td>${stage.stage_name}</td>
            <td>${new Date(stage.created_at).toLocaleDateString()}</td>
            <td>
                <button class="btn-edit" onclick="editStage(${stage.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteStage(${stage.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    updateStats();
}

async function showAddStageModal() {
    currentEditId = null;
    currentEditType = 'stage';
    document.getElementById('stageModalTitle').textContent = 'Add Stage';
    document.getElementById('stageForm').reset();
    
    await loadLeadsDropdown();
    showModal('stageModal');
}

async function loadLeadsDropdown() {
    const response = await apiRequest('/leads');
    const select = document.getElementById('stageLead');
    select.innerHTML = '<option value="">Select Lead</option>';
    
    if (response && response.success) {
        response.data.forEach(lead => {
            const option = document.createElement('option');
            option.value = lead.id;
            option.textContent = `${lead.customer_name} - ${lead.lead_source}`;
            select.appendChild(option);
        });
    }
}

async function handleStageSubmit(e) {
    e.preventDefault();
    
    const stageData = {
        lead_id: document.getElementById('stageLead').value,
        stage_name: document.getElementById('stageName').value
    };
    
    const endpoint = currentEditId ? `/stages/${currentEditId}` : '/stages';
    const method = currentEditId ? 'PUT' : 'POST';
    
    const result = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(stageData)
    });
    
    if (result && result.success) {
        closeModal();
        loadStages();
        showMessage(currentEditId ? 'Stage updated successfully!' : 'Stage added successfully!', 'success');
    }
}

async function deleteStage(id) {
    if (confirm('Are you sure you want to delete this stage?')) {
        const result = await apiRequest(`/stages/${id}`, { method: 'DELETE' });
        if (result && result.success) {
            loadStages();
            showMessage('Stage deleted successfully!', 'success');
        }
    }
}

// Communication functions
async function loadCommunicationHistory() {
    const response = await apiRequest('/communication/history');
    if (response && response.success) {
        displayCommunicationHistory(response.data);
    }
}

function displayCommunicationHistory(history) {
    const container = document.getElementById('communicationHistory');
    container.innerHTML = '';
    
    if (history.length === 0) {
        container.innerHTML = '<p>No communication history found.</p>';
        return;
    }
    
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'comm-item';
        div.innerHTML = `
            <div class="comm-icon ${item.communication_type}">
                <i class="fas fa-${item.communication_type === 'email' ? 'envelope' : item.communication_type === 'sms' ? 'sms' : 'phone'}"></i>
            </div>
            <div class="comm-details">
                <strong>${item.communication_type.toUpperCase()} to ${item.recipient}</strong>
                <p>${item.subject || item.message}</p>
                <small>Status: ${item.status} | ${new Date(item.created_at).toLocaleString()}</small>
            </div>
        `;
        container.appendChild(div);
    });
}

function showSendEmailModal() {
    loadCustomersDropdown('emailCustomer');
    showModal('emailModal');
}

function showSendSMSModal() {
    loadCustomersDropdown('smsCustomer');
    showModal('smsModal');
}

function showMakeCallModal() {
    loadCustomersDropdown('callCustomer');
    showModal('callModal');
}

async function handleEmailSubmit(e) {
    e.preventDefault();
    
    const emailData = {
        customer_id: document.getElementById('emailCustomer').value,
        recipient: document.getElementById('emailRecipient').value,
        subject: document.getElementById('emailSubject').value,
        message: document.getElementById('emailMessage').value
    };
    
    const result = await apiRequest('/communication/email', {
        method: 'POST',
        body: JSON.stringify(emailData)
    });
    
    if (result && result.success) {
        closeModal();
        showMessage('Email sent successfully!', 'success');
        loadCommunicationHistory();
    }
}

async function handleSMSSubmit(e) {
    e.preventDefault();
    
    const smsData = {
        customer_id: document.getElementById('smsCustomer').value,
        recipient: document.getElementById('smsRecipient').value,
        message: document.getElementById('smsMessage').value
    };
    
    const result = await apiRequest('/communication/sms', {
        method: 'POST',
        body: JSON.stringify(smsData)
    });
    
    if (result && result.success) {
        closeModal();
        showMessage('SMS sent successfully!', 'success');
        loadCommunicationHistory();
    }
}

async function handleCallSubmit(e) {
    e.preventDefault();
    
    const callData = {
        customer_id: document.getElementById('callCustomer').value,
        recipient: document.getElementById('callRecipient').value,
        message: document.getElementById('callMessage').value
    };
    
    const result = await apiRequest('/communication/call', {
        method: 'POST',
        body: JSON.stringify(callData)
    });
    
    if (result && result.success) {
        closeModal();
        showMessage('Call initiated successfully!', 'success');
        loadCommunicationHistory();
    }
}

// Modal functions
function showModal(modalId) {
    document.getElementById('modalOverlay').classList.add('active');
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    document.getElementById(modalId).style.display = 'block';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    currentEditId = null;
    currentEditType = null;
}

// Utility functions
function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the active page
    const activePage = document.querySelector('.page.active');
    if (activePage) {
        activePage.insertBefore(messageDiv, activePage.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}