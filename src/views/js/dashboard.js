console.log('Dashboard.js loaded');

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    try {
        await checkAuth();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
});

// Authentication functions
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function getUserRole() {
    try {
        const token = getAuthToken();
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', payload); // Debug log
            return payload.role;
        }
    } catch (error) {
        console.error('Error decoding token:', error);
    }
    return null;
}

async function checkAuth() {
    console.log('Checking auth...');
    const token = getAuthToken();
    console.log('Token available:', !!token); // Debug log
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Add this debug log
    console.log('About to display welcome message');
    await displayWelcomeMessage();
    console.log('Welcome message should be displayed');

    const role = getUserRole();
    
    console.log('Token:', token);
    console.log('Role:', role);

    const adminContent = document.getElementById('adminContent');
    const userContent = document.getElementById('userContent');

    if (!adminContent || !userContent) {
        console.error('Required DOM elements not found');
        return;
    }

    // Hide both views initially
    adminContent.style.display = 'none';
    userContent.style.display = 'none';

    // Show appropriate view based on role
    if (role === "1" || role === 1) { // Check both string and number
        console.log('Loading admin view');
        adminContent.style.display = 'block';
        
        // Load admin data
        try {
            await Promise.all([
                listUsers(),
                listExpenses(),
                listDonations()
            ]);
        } catch (error) {
            console.error('Error loading admin data:', error);
            if (error.response?.status === 403) {
                logout(); // Token expired or invalid
            }
        }
    } else {
        console.log('Loading user view');
        userContent.style.display = 'block';
        setTimeout(initMap, 500);
    }
}

function logout() {
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

// Modal show functions
function showAddUserModal() {
    const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
    modal.show();
}

function showAddExpenseModal() {
    const modal = new bootstrap.Modal(document.getElementById('addExpenseModal'));
    modal.show();
}

function showAddDonationModal() {
    const modal = new bootstrap.Modal(document.getElementById('addDonationModal'));
    modal.show();
}

// Users functions
async function addUser() {
    try {
        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;
        const phone = document.getElementById('userPhone').value;
        const role = parseInt(document.getElementById('userRole').value);
        const password = document.getElementById('userPassword').value;

        if (!name || !email || !phone || !role || !password) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        const response = await axios.post('/user', {
            name,
            email,
            password,
            phone,
            role
        });

        if (response.data.success) {
            alert('Usuário adicionado com sucesso!');
            document.getElementById('addUserForm').reset();
            bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
            await listUsers();
        }
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Erro ao adicionar usuário: ' + (error.response?.data?.message || error.message));
    }
}

async function listUsers() {
    showLoading('usersList');
    try {
        const response = await axios.get('/users');
        const users = response.data.values;
        const usersList = document.getElementById('usersList');
        
        if (!users || users.length === 0) {
            usersList.innerHTML = '<p class="text-muted">Nenhum usuário registrado.</p>';
            return;
        }

        usersList.innerHTML = users.map(user => {
            console.log(`User ${user.name} role:`, user.role, typeof user.role);
            
            const roleNum = parseInt(user.role);
            const roleText = roleNum === 1 ? 'Administrador' : 'Usuário';
            const roleClass = roleNum === 1 ? 'text-danger' : 'text-success';
            
            return `
                <div class="card mb-2">
                    <div class="card-body">
                        <h5 class="card-title">${user.name}</h5>
                        <p class="card-text">
                            <strong>Email:</strong> ${user.email}<br>
                            <strong>Telefone:</strong> ${user.phone}<br>
                            <strong>Função:</strong> <span class="${roleClass}">${roleText}</span>
                        </p>
                        <div class="btn-group">
                            <button class="btn btn-primary btn-sm me-2" onclick="editUserRole(${user.id}, ${roleNum})">
                                <i class="bi bi-pencil"></i> ${roleNum === 1 ? 'Remover Admin' : 'Tornar Admin'}
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                                <i class="bi bi-trash"></i> Excluir
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error listing users:', error);
        usersList.innerHTML = `
            <div class="alert alert-danger">
                Erro ao carregar usuários: ${error.response?.data?.message || error.message}
            </div>
        `;
    }
}

async function editUserRole(userId, currentRole) {
    try {
        const currentRoleNum = parseInt(currentRole);
        const newRole = currentRoleNum === 1 ? 2 : 1; // Toggle between admin (1) and user (2)
        
        console.log('Current role:', currentRoleNum, 'New role:', newRole); // Debug log
        
        const confirmMessage = newRole === 1 
            ? 'Deseja tornar este usuário um Administrador?' 
            : 'Deseja remover os privilégios de Administrador deste usuário?';

        if (!confirm(confirmMessage)) {
            return;
        }

        const response = await axios.put(`/user/${userId}`, {
            role: newRole
        });

        if (response.data.success) {
            alert('Função do usuário atualizada com sucesso!');
            await listUsers(); // Refresh the list
        } else {
            alert('Erro ao atualizar função do usuário: ' + response.data.message);
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        alert('Erro ao atualizar função do usuário: ' + (error.response?.data?.message || error.message));
    }
}

async function deleteUser(id) {
    try {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) {
            return;
        }

        console.log('Frontend: Attempting to delete user:', id);
        const response = await axios.delete(`/user/${id}`);
        
        console.log('Delete response:', response.data);
        
        if (response.data.success) {
            alert('Usuário excluído com sucesso!');
            await listUsers(); // Refresh the list
        } else {
            throw new Error(response.data.message || 'Erro ao excluir usuário');
        }
    } catch (error) {
        console.error('Delete error:', error);
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Error details:', errorMessage);
        alert('Erro ao excluir usuário: ' + errorMessage);
    }
}

// Expenses functions
async function addExpense() {
    try {
        const description = document.getElementById('expenseDescription').value;
        const amount = document.getElementById('expenseAmount').value;
        const date = document.getElementById('expenseDate').value;

        const response = await axios.post('/expense', {
            description,
            amount,
            date
        });

        if (response.data.success) {
            alert('Despesa adicionada com sucesso!');
            bootstrap.Modal.getInstance(document.getElementById('addExpenseModal')).hide();
            listExpenses();
        }
    } catch (error) {
        console.error('Error adding expense:', error);
        alert('Erro ao adicionar despesa');
    }
}

async function listExpenses() {
    showLoading('expensesList');
    try {
        const response = await axios.get('/expenses', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.data || !response.data.values) {
            document.getElementById('expensesList').innerHTML = 
                '<p class="text-muted">Nenhuma despesa registrada.</p>';
            return;
        }

        const expenses = response.data.values;
        const expensesList = document.getElementById('expensesList');
        
        expensesList.innerHTML = expenses.map(expense => `
            <div class="card mb-2">
                <div class="card-body">
                    <h5 class="card-title">${expense.description}</h5>
                    <p class="card-text">
                        <strong>Valor:</strong> R$ ${parseFloat(expense.amount).toFixed(2)}<br>
                        <strong>Data:</strong> ${new Date(expense.date).toLocaleDateString()}
                    </p>
                    <div class="btn-group">
                        <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">
                            <i class="bi bi-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error listing expenses:', error);
        document.getElementById('expensesList').innerHTML = 
            `<div class="alert alert-danger">Erro ao carregar despesas: ${error.response?.data?.message || error.message}</div>`;
    }
}

async function deleteExpense(id) {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
        try {
            await axios.delete(`/expense/${id}`);
            alert('Despesa excluída com sucesso!');
            listExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Erro ao excluir despesa');
        }
    }
}

// Donations functions
async function addDonation() {
    try {
        const donorName = document.getElementById('donorName').value;
        const amount = parseFloat(document.getElementById('donationAmount').value);
        const date = document.getElementById('donationDate').value;

        if (!donorName || !amount || !date) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        const response = await axios.post('/donation', {
            donorName,
            amount,
            date
        });

        if (response.data.success) {
            alert('Doação registrada com sucesso!');
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addDonationModal'));
            modal.hide();
            // Clear the form
            document.getElementById('addDonationForm').reset();
            // Refresh the donations list
            await listDonations();
        } else {
            throw new Error(response.data.message || 'Erro ao adicionar doação');
        }
    } catch (error) {
        console.error('Error adding donation:', error);
        alert('Erro ao adicionar doação: ' + (error.response?.data?.message || error.message));
    }
}

async function listDonations() {
    showLoading('donationsList');
    try {
        const response = await axios.get('/donations', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.data || !response.data.values) {
            document.getElementById('donationsList').innerHTML = 
                '<p class="text-muted">Nenhuma doação registrada.</p>';
            return;
        }

        const donations = response.data.values;
        const donationsList = document.getElementById('donationsList');
        
        donationsList.innerHTML = donations.map(donation => `
            <div class="card mb-2">
                <div class="card-body">
                    <h5 class="card-title">${donation.donorName || donation.description}</h5>
                    <p class="card-text">
                        <strong>Valor:</strong> R$ ${parseFloat(donation.amount).toFixed(2)}<br>
                        <strong>Data:</strong> ${new Date(donation.date).toLocaleDateString()}
                    </p>
                    <div class="btn-group">
                        <button class="btn btn-danger btn-sm" onclick="deleteDonation(${donation.id})">
                            <i class="bi bi-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error listing donations:', error);
        document.getElementById('donationsList').innerHTML = 
            `<div class="alert alert-danger">Erro ao carregar doações: ${error.response?.data?.message || error.message}</div>`;
    }
}

async function deleteDonation(id) {
    if (!confirm('Tem certeza que deseja excluir esta doação?')) {
        return;
    }

    try {
        const response = await axios.delete(`/donation/${id}`);
        if (response.data.success) {
            alert('Doação excluída com sucesso!');
            await listDonations(); // Refresh the list
        } else {
            throw new Error(response.data.message || 'Erro ao excluir doação');
        }
    } catch (error) {
        console.error('Error deleting donation:', error);
        alert('Erro ao excluir doação: ' + (error.response?.data?.message || error.message));
    }
}

async function editDonation(id) {
    try {
        // Fetch the donation details
        const response = await axios.get(`/donation/${id}`);
        const donation = response.data.values;

        // Prompt for new values (you might want to create a modal for this instead)
        const newDonorName = prompt('Nome do doador:', donation.donor_name);
        const newAmount = prompt('Valor:', donation.amount);
        const newDate = prompt('Data (YYYY-MM-DD):', donation.date.split('T')[0]);

        if (!newDonorName || !newAmount || !newDate) {
            return; // User cancelled
        }

        // Update the donation
        const updateResponse = await axios.put(`/donation/${id}`, {
            donorName: newDonorName,
            amount: parseFloat(newAmount),
            date: newDate
        });

        if (updateResponse.data.success) {
            alert('Doação atualizada com sucesso!');
            await listDonations(); // Refresh the list
        } else {
            throw new Error(updateResponse.data.message || 'Erro ao atualizar doação');
        }
    } catch (error) {
        console.error('Error editing donation:', error);
        alert('Erro ao editar doação: ' + (error.response?.data?.message || error.message));
    }
}

// Add axios interceptor setup
axios.interceptors.request.use(function (config) {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Add axios response interceptor for handling auth errors
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 403) {
            console.log('Authentication error:', error.response.data.message);
            if (error.response.data.message.includes('não autenticado')) {
                logout();
            }
        }
        return Promise.reject(error);
    }
);

// Add this new function
async function displayWelcomeMessage() {
    try {
        const token = getAuthToken();
        if (!token) return;

        // Decode token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload); // Debug log

        const welcomeMessage = document.getElementById('welcomeMessage');
        if (welcomeMessage) {
            // Use email if name is not available in token
            const displayName = payload.email || 'Usuário';
            welcomeMessage.innerHTML = `Bem-vindo(a), ${displayName}!`;
            console.log('Welcome message set to:', welcomeMessage.innerHTML); // Debug log
        } else {
            console.log('Welcome message element not found'); // Debug log
        }
    } catch (error) {
        console.error('Error displaying welcome message:', error);
    }
}


function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <p class="mt-2">Carregando...</p>
            </div>
        `;
    }
}

async function listExpenses() {
    showLoading('expensesList');
    try {
        const response = await axios.get('/expenses', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.data || !response.data.values) {
            document.getElementById('expensesList').innerHTML = 
                '<p class="text-muted">Nenhuma despesa registrada.</p>';
            return;
        }

        const expenses = response.data.values;
        const expensesList = document.getElementById('expensesList');
        
        expensesList.innerHTML = expenses.map(expense => `
            <div class="card mb-2">
                <div class="card-body">
                    <h5 class="card-title">${expense.description}</h5>
                    <p class="card-text">
                        <strong>Valor:</strong> R$ ${parseFloat(expense.amount).toFixed(2)}<br>
                        <strong>Data:</strong> ${new Date(expense.date).toLocaleDateString()}
                    </p>
                    <div class="btn-group">
                        <button class="btn btn-danger btn-sm" onclick="deleteExpense(${expense.id})">
                            <i class="bi bi-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error listing expenses:', error);
        document.getElementById('expensesList').innerHTML = 
            `<div class="alert alert-danger">Erro ao carregar despesas: ${error.response?.data?.message || error.message}</div>`;
    }
}

async function listDonations() {
    showLoading('donationsList');
    try {
        const response = await axios.get('/donations', {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.data || !response.data.values) {
            document.getElementById('donationsList').innerHTML = 
                '<p class="text-muted">Nenhuma doação registrada.</p>';
            return;
        }

        const donations = response.data.values;
        const donationsList = document.getElementById('donationsList');
        
        donationsList.innerHTML = donations.map(donation => `
            <div class="card mb-2">
                <div class="card-body">
                    <h5 class="card-title">${donation.donorName || donation.description}</h5>
                    <p class="card-text">
                        <strong>Valor:</strong> R$ ${parseFloat(donation.amount).toFixed(2)}<br>
                        <strong>Data:</strong> ${new Date(donation.date).toLocaleDateString()}
                    </p>
                    <div class="btn-group">
                        <button class="btn btn-danger btn-sm" onclick="deleteDonation(${donation.id})">
                            <i class="bi bi-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error listing donations:', error);
        document.getElementById('donationsList').innerHTML = 
            `<div class="alert alert-danger">Erro ao carregar doações: ${error.response?.data?.message || error.message}</div>`;
    }
}

// Add this near the top of the file
axios.interceptors.request.use(request => {
    console.log('Starting Request:', {
        method: request.method,
        url: request.url,
        data: request.data
    });
    return request;
});

axios.interceptors.response.use(response => {
    console.log('Response:', {
        status: response.status,
        data: response.data
    });
    return response;
}, error => {
    console.log('Response Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
    });
    return Promise.reject(error);
});