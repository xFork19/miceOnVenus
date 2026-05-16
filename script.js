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
const settingsBtn = document.getElementById('settingsBtn') || document.getElementById('settingsBtnNav');
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
let showSavedOnly = false;

function getSavedPosts() {
    try { return JSON.parse(localStorage.getItem('savedPosts') || '[]'); } catch(e) { return []; }
}

function setSavedPosts(arr) { localStorage.setItem('savedPosts', JSON.stringify(arr)); }

function getLikedPosts() {
    try { return JSON.parse(localStorage.getItem('likedPosts') || '[]'); } catch(e) { return []; }
}

function setLikedPosts(arr) { localStorage.setItem('likedPosts', JSON.stringify(arr)); }

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
        const type = card.dataset.type || 'post';
        const title = card.querySelector('.card-info h3').textContent.toLowerCase();
        const author = card.querySelector('.card-author').textContent.toLowerCase();
        const category = card.querySelector('.card-meta span:first-child').textContent.toLowerCase();
        
        const matchesSearch = title.includes(currentSearch) || author.includes(currentSearch);
        const matchesCategory = currentCategory === 'all' || category.includes(currentCategory);
        let visible = matchesSearch && matchesCategory;

        if (currentView === 'posts' && type === 'video') {
            visible = false;
        }
        if (currentView === 'videos' && type !== 'video') {
            visible = false;
        }

        if (showSavedOnly) {
            const saved = getSavedPosts();
            if (!saved.includes(card.dataset.id)) {
                visible = false;
            }
        }

        card.style.display = visible ? '' : 'none';
    });
}

// Card click handler — open inline single-post view
const cards = document.querySelectorAll('.diagram-card');
cards.forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn') || e.target.closest('.save-btn')) return;
        const id = card.dataset.id;
        if (id) openSinglePost(id);
    });
});

// Small client-side post dataset (used for single-post view)
const POSTS = {
    '1': {id:'1', title:'Graph Theory Basics', author:'Alex Johnson', category:'Mathematics', likes:284, content:'A concise overview of graph theory basics.'},
    '2': {id:'2', title:'Cell Biology Overview', author:'Sarah Chen', category:'Science', likes:156, content:'Fundamentals of cell structure and function.'},
    '3': {id:'3', title:'European Geography', author:'Mike Rodriguez', category:'History', likes:92, content:'Maps and regional facts for Europe.'},
    '4': {id:'4', title:"Shakespeare's Characters", author:'Emily Watson', category:'Languages', likes:201, content:"Notes on major characters and themes."},
    '5': {id:'5', title:'Chemistry Fundamentals', author:'David Lee', category:'Science', likes:178, content:'Atomic structure and basic chemistry.'},
    '6': {id:'6', title:'Renaissance Art Timeline', author:'Julia Martinez', category:'Arts & Design', likes:145, content:'Timeline and key artists.'},
    '7': {id:'7', title:'Derivatives & Integrals', author:'Tom Anderson', category:'Mathematics', likes:267, content:'Core calculus concepts.'},
    '8': {id:'8', title:'Solar System Guide', author:'Lisa Park', category:'Science', likes:189, content:'Planets and their properties.'},
    '9': {id:'9', title:'Design Principles', author:'Chris Brown', category:'Arts & Design', likes:134, content:'Basics of composition and color.'},
    '10': {id:'10', title:"Newton's Laws in Motion", author:'Jordan Lee', category:'Video', likes:68, content:'A short video walkthrough explaining the three laws of motion.'},
    '11': {id:'11', title:'Memory Techniques', author:'Maya King', category:'Video', likes:84, content:'A quick study video on memory and recall strategies.'},
    '12': {id:'12', title:'Study Session Walkthrough', author:'Alex Pat', category:'Video', likes:99, content:'A guided session with tips for exam prep and focus.'}
};

const singlePostView = document.getElementById('singlePostView');
const postImage = document.getElementById('postImage');
const postTitleInline = document.getElementById('postTitleInline');
const postAuthor = document.getElementById('postAuthor');
const postContent = document.getElementById('postContent');
const likeInline = document.getElementById('likeInline');
const saveInline = document.getElementById('saveInline');
const followInline = document.getElementById('followInline');
const commentsListInline = document.getElementById('commentsListInline');
const commentFormInline = document.getElementById('commentFormInline');
const commentInputInline = document.getElementById('commentInputInline');
const relatedGrid = document.getElementById('relatedGrid');
const closePostView = document.getElementById('closePostView');

function openSinglePost(id) {
    const post = POSTS[id] || null;
    if (!post) return;

    // Populate header/info
    postTitleInline.textContent = post.title;
    postAuthor.textContent = `by ${post.author}`;
    document.getElementById('postCategory').textContent = post.category;
    postContent.textContent = post.content;

    // Show image — copy from card if available
    const card = document.querySelector(`.diagram-card[data-id="${id}"]`);
    const placeholder = card ? card.querySelector('.diagram-placeholder').innerHTML : '';
    postImage.innerHTML = placeholder || '📷';

    // Likes/follows/saves state
    const liked = getLikedPosts();
    const saved = getSavedPosts();
    const followed = JSON.parse(localStorage.getItem('followedAuthors') || '[]');

    likeInline.textContent = `❤️ ${post.likes}`;
    if (liked.includes(id)) likeInline.classList.add('liked'); else likeInline.classList.remove('liked');
    if (saved.includes(id)) saveInline.classList.add('saved'); else saveInline.classList.remove('saved');
    if (followed.includes(post.author)) followInline.textContent = 'Following'; else followInline.textContent = 'Follow';

    // Comments
    renderCommentsInline(id);

    // Related posts
    relatedGrid.innerHTML = '';
    document.querySelectorAll('.diagram-card').forEach(c => {
        if (c.dataset.id === id) return;
        const cat = c.querySelector('.card-meta span:first-child').textContent;
        if (cat && cat.toLowerCase() === post.category.toLowerCase()) {
            const clone = c.cloneNode(true);
            clone.classList.add('related-card');
            clone.addEventListener('click', () => openSinglePost(clone.dataset.id));
            relatedGrid.appendChild(clone);
        }
    });

    // Show view
    diagramGrid.style.display = 'none';
    singlePostView.style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // wire actions
    likeInline.onclick = (e) => {
        e.stopPropagation();
        const l = getLikedPosts();
        if (l.includes(id)) return; // one-like
        l.push(id); setLikedPosts(l);
        // update UI
        const match = likeInline.textContent.match(/\d+/);
        const count = match ? parseInt(match[0]) : 0;
        likeInline.textContent = `❤️ ${count+1}`;
        likeInline.classList.add('liked');
    };

    saveInline.onclick = (e) => {
        e.stopPropagation();
        const s = getSavedPosts();
        const idx = s.indexOf(id);
        if (idx === -1) { s.push(id); saveInline.classList.add('saved'); } else { s.splice(idx,1); saveInline.classList.remove('saved'); }
        setSavedPosts(s);
    };

    followInline.onclick = (e) => {
        e.stopPropagation();
        const f = JSON.parse(localStorage.getItem('followedAuthors') || '[]');
        if (!f.includes(post.author)) { f.push(post.author); followInline.textContent='Following'; } else { const i=f.indexOf(post.author); f.splice(i,1); followInline.textContent='Follow'; }
        localStorage.setItem('followedAuthors', JSON.stringify(f));
    };

    commentFormInline.onsubmit = () => {
        const v = commentInputInline.value.trim();
        if (!v) return false;
        const key = `comments_${id}`;
        const arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push(v); localStorage.setItem(key, JSON.stringify(arr));
        commentInputInline.value = '';
        renderCommentsInline(id);
        return false;
    };

    closePostView.onclick = () => {
        singlePostView.style.display = 'none';
        diagramGrid.style.display = '';
    };
}

function renderCommentsInline(id) {
    const key = `comments_${id}`;
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    commentsListInline.innerHTML = '';
    arr.forEach(c => {
        const d = document.createElement('div'); d.className = 'comment'; d.textContent = c; commentsListInline.appendChild(d);
    });
}

// Like button functionality — enforce single-like per client (localStorage)
document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = e.target.closest('.diagram-card');
        const id = card?.dataset.id;
        if (!id) return;

        const liked = getLikedPosts();
        if (liked.includes(id)) {
            // already liked — do nothing
            return;
        }

        // increment visible count
        const match = btn.textContent.match(/\d+/);
        const currentLikes = match ? parseInt(match[0]) : 0;
        btn.textContent = `❤️ ${currentLikes + 1}`;
        liked.push(id);
        setLikedPosts(liked);
    });
});

// Save button functionality
document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = e.target.closest('.diagram-card');
        const id = card?.dataset.id;
        if (!id) return;

        const saved = getSavedPosts();
        const idx = saved.indexOf(id);
        if (idx === -1) {
            saved.push(id);
            btn.classList.add('saved');
            btn.textContent = '🔖';
        } else {
            saved.splice(idx, 1);
            btn.classList.remove('saved');
            btn.textContent = '🔖';
        }
        setSavedPosts(saved);
    });
});

    // Initialize saved/liked states on page load
    document.querySelectorAll('.diagram-card').forEach(card => {
        const id = card.dataset.id;
        if (!id) return;
        const saved = getSavedPosts();
        const liked = getLikedPosts();
        const saveBtn = card.querySelector('.save-btn');
        const likeBtn = card.querySelector('.like-btn');
        if (saveBtn && saved.includes(id)) {
            saveBtn.classList.add('saved');
            saveBtn.textContent = '🔖';
        }
        if (likeBtn && liked.includes(id)) {
            likeBtn.classList.add('liked');
        }
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
        viewTitle.textContent = showSavedOnly ? 'Saved Posts' : 'All Posts';
    } else if (view === 'videos') {
        videosBtn?.classList.add('active');
        viewTitle.textContent = showSavedOnly ? 'Saved Videos' : 'All Videos';
    }
    
    filterDiagrams();
}

postsBtn?.addEventListener('click', () => {
    switchView('posts');
});

videosBtn?.addEventListener('click', () => {
    switchView('videos');
});

// Apply the default view filter on page load
filterDiagrams();

// Upload button functionality
const uploadOptions = document.querySelectorAll('.option-item');
if (uploadOptions.length > 0) {
    uploadOptions[0].addEventListener('click', () => {
        alert('Upload Diagram feature coming soon!');
    });
}

// Saved button functionality — toggle showing only saved posts
if (uploadOptions.length > 1) {
    uploadOptions[1].addEventListener('click', () => {
        showSavedOnly = !showSavedOnly;
        if (showSavedOnly) {
            viewTitle.textContent = currentView === 'videos' ? 'Saved Videos' : 'Saved Posts';
        } else {
            viewTitle.textContent = currentView === 'videos' ? 'All Videos' : 'All Posts';
        }
        filterDiagrams();
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
