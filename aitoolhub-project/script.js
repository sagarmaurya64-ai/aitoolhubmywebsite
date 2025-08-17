document.addEventListener('DOMContentLoaded', () => {
    const toolGrid = document.querySelector('.tool-grid');
    const authModal = document.getElementById('auth-modal');
    const closeModalBtn = document.getElementById('close-modal');
    
    // IMPORTANT: We will replace this with our live backend URL later
    const API_URL = 'https://aitoolhub-backend.onrender.com; 
    let currentPage = 1;
    let isLoading = false;
    let totalPages = 1;

    // --- Data Fetching & Rendering ---
    const fetchTools = async (page) => {
        if (isLoading || page > totalPages) return;
        isLoading = true;
        
        try {
            const response = await fetch(`${API_URL}/tools?page=${page}&limit=20`);
            const data = await response.json();
            
            renderTools(data.tools);
            currentPage = data.currentPage + 1;
            totalPages = data.totalPages;
        } catch (error) {
            console.error('Failed to fetch tools:', error);
        } finally {
            isLoading = false;
        }
    };

    const renderTools = (tools) => {
        let toolsHTML = '';
        tools.forEach(tool => {
            toolsHTML += `
                <div class="tool-card" data-id="${tool._id}">
                    <div class="card-main-link">
                        <div class="card-header">
                            <img src="${tool.logo_url}" alt="${tool.name} Logo" class="tool-logo">
                            <span class="access-badge ${tool.access_model.toLowerCase().replace(' ', '-')}">${tool.access_model}</span>
                        </div>
                        <h3>${tool.name}</h3>
                        <p class="card-description">${tool.description}</p>
                    </div>
                    <button class="btn-get-tool">Get Tool →</button>
                </div>
            `;
        });
        toolGrid.innerHTML += toolsHTML;
    };

    // --- Infinite Scroll ---
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            fetchTools(currentPage);
        }
    });

    // --- Authentication Flow ---
    toolGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-get-tool')) {
            const toolCard = e.target.closest('.tool-card');
            const toolId = toolCard.dataset.id;
            handleGetTool(toolId);
        }
    });
    
    const handleGetTool = async (toolId) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            authModal.style.display = 'flex';
            localStorage.setItem('pendingToolId', toolId);
        } else {
            try {
                const response = await fetch(`${API_URL}/tools/${toolId}/access`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    localStorage.removeItem('authToken');
                    authModal.style.display = 'flex';
                    localStorage.setItem('pendingToolId', toolId);
                    return;
                }
                const data = await response.json();
                window.open(data.url, '_blank');
            } catch (error) {
                console.error('Error accessing tool:', error);
            }
        }
    };

    // --- Modal Logic ---
    closeModalBtn.addEventListener('click', () => authModal.style.display = 'none');
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });
     document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    document.querySelector('#login-form form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        await authenticateUser(`${API_URL}/users/login`, { email, password });
    });

    document.querySelector('#register-form form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        await authenticateUser(`${API_URL}/users/register`, { email, password });
    });

    const authenticateUser = async (url, userData) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('authToken', data.token);
                authModal.style.display = 'none';
                const pendingToolId = localStorage.getItem('pendingToolId');
                if (pendingToolId) {
                    localStorage.removeItem('pendingToolId');
                    handleGetTool(pendingToolId);
                }
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        }
    };
    
    // Initial Load
    fetchTools(currentPage);
});