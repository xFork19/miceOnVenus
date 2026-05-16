// Sidebar toggle functionality
const sidebarToggle = document.getElementById('sidebarToggle');
const leftSidebar = document.getElementById('leftSidebar');

sidebarToggle?.addEventListener('click', () => {
    sidebarToggle.classList.toggle('active');
    leftSidebar.classList.toggle('collapsed');
    localStorage.setItem('sidebarCollapsed', leftSidebar.classList.contains('collapsed'));
});

// Restore sidebar state
if (localStorage.getItem('sidebarCollapsed') === 'true') {
    leftSidebar?.classList.add('collapsed');
    sidebarToggle?.classList.add('active');
}

// Settings modal functionality
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const modalClose = document.getElementById('modalClose');

settingsBtn?.addEventListener('click', () => {
    settingsModal?.classList.add('active');
});

modalClose?.addEventListener('click', () => {
    settingsModal?.classList.remove('active');
});

settingsModal?.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.remove('active');
    }
});

// Theme switching functionality
const themeOptions = document.querySelectorAll('input[name="theme"]');
const htmlElement = document.documentElement;

// Load saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
applyTheme(savedTheme);

function applyTheme(theme) {
    document.body.classList.remove('dark-mode', 'auto-mode');
    
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (theme === 'auto') {
        document.body.classList.add('auto-mode');
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
        }
    }
    
    localStorage.setItem('theme', theme);
    
    // Update radio button
    themeOptions.forEach(option => {
        option.checked = option.value === theme;
    });
}

themeOptions.forEach(option => {
    option.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });
});

// Listen for system theme changes if auto is selected
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === 'auto') {
            applyTheme('auto');
        }
    });
}

// Display settings toggles
const displayToggles = document.querySelectorAll('.settings-action-btn');
const notificationToggle = document.querySelector('.settings-toggle input[type="checkbox"]:nth-of-type(4)');
const soundToggle = document.querySelector('.settings-toggle input[type="checkbox"]:nth-of-type(5)');

// Save notification and sound preferences
document.querySelectorAll('.settings-toggle input[type="checkbox"]').forEach((toggle, index) => {
    const key = `setting_${index}`;
    if (localStorage.getItem(key)) {
        toggle.checked = localStorage.getItem(key) === 'true';
    }
    toggle.addEventListener('change', () => {
        localStorage.setItem(key, toggle.checked);
    });
});

// Category filter functionality
const categoryItems = document.querySelectorAll('.category-item');
const searchBar = document.querySelector('.search-bar');

let currentCategory = 'all';
let currentSearch = '';

// Category filtering
categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        categoryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentCategory = item.dataset.category;
        filterDiagrams();
    });
});

// Search functionality
searchBar?.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    filterDiagrams();
});

function filterDiagrams() {
    const cards = document.querySelectorAll('.diagram-card');
    
    cards.forEach(card => {
        const title = card.querySelector('.card-info h3').textContent.toLowerCase();
        const author = card.querySelector('.card-author').textContent.toLowerCase();
        const category = card.querySelector('.card-meta span:first-child').textContent.toLowerCase();
        
        const matchesSearch = title.includes(currentSearch) || author.includes(currentSearch);
        const matchesCategory = currentCategory === 'all' || category.includes(currentCategory);
        
        if (matchesSearch && matchesCategory) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

// Card click handler
const cards = document.querySelectorAll('.diagram-card');
cards.forEach(card => {
    card.addEventListener('click', () => {
        const title = card.querySelector('.card-info h3').textContent;
        const author = card.querySelector('.card-author').textContent;
        alert(`Opening: ${title}\n${author}`);
    });
});

// Like button functionality
const likeButtons = document.querySelectorAll('.card-meta span:last-child');
likeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentLikes = parseInt(btn.textContent.match(/\d+/)[0]);
        btn.textContent = `❤️ ${currentLikes + 1}`;
    });
});

// Current view state
let currentView = 'posts';

// Posts and Videos button functionality
const postsBtn = document.querySelector('.posts-btn');
const videosBtn = document.querySelector('.videos-btn');
const viewTitle = document.getElementById('viewTitle');
const diagramGrid = document.getElementById('diagramGrid');

function switchView(view) {
    currentView = view;
    
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (view === 'posts') {
        postsBtn?.classList.add('active');
        viewTitle.textContent = 'All Posts';
    } else if (view === 'videos') {
        videosBtn?.classList.add('active');
        viewTitle.textContent = 'All Videos';
    }
    
    // Show/hide diagrams based on type
    const cards = document.querySelectorAll('.diagram-card');
    cards.forEach(card => {
        card.style.display = '';
    });
}

postsBtn?.addEventListener('click', () => {
    switchView('posts');
});

videosBtn?.addEventListener('click', () => {
    switchView('videos');
});

// Upload button functionality
const uploadOptions = document.querySelectorAll('.option-item');
if (uploadOptions.length > 0) {
    uploadOptions[0].addEventListener('click', () => {
        alert('Upload Diagram feature coming soon!');
    });
}

// Saved button functionality
if (uploadOptions.length > 1) {
    uploadOptions[1].addEventListener('click', () => {
        alert('View your saved diagrams!');
    });
}

// Following button functionality
if (uploadOptions.length > 2) {
    uploadOptions[2].addEventListener('click', () => {
        alert('View diagrams from users you follow!');
    });
}

// Direct Messages button functionality
if (uploadOptions.length > 3) {
    uploadOptions[3].addEventListener('click', () => {
        alert('Direct Messages coming soon!');
    });
}

// Study Sessions button functionality
if (uploadOptions.length > 4) {
    uploadOptions[4].addEventListener('click', () => {
        alert('Study Sessions coming soon!');
    });
}

// Notification button
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        alert('No new notifications');
    });
}

// Profile button
const profileBtn = document.querySelector('.profile-btn');
if (profileBtn) {
    profileBtn.addEventListener('click', () => {
        alert('View your profile!');
    });
}

// Settings action buttons
const editProfileBtn = document.querySelectorAll('.settings-action-btn')[0];
const changePasswordBtn = document.querySelectorAll('.settings-action-btn')[1];
const logoutBtn = document.querySelectorAll('.settings-action-btn')[2];

editProfileBtn?.addEventListener('click', () => {
    alert('Edit Profile page coming soon!');
});

changePasswordBtn?.addEventListener('click', () => {
    alert('Change Password page coming soon!');
});

logoutBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        alert('Logging out...');
        // In a real app, this would redirect to login
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Focus search bar with Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchBar?.focus();
    }
    
    // Close modal with Escape
    if (e.key === 'Escape') {
        settingsModal?.classList.remove('active');
    }
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';
