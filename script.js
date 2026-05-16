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

// Logo click returns to the default feed
const logoLink = document.querySelector('.logo');
logoLink?.addEventListener('click', () => {
    resetMainView();
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
let currentFolder = null;

function getMaterials() {
    try { return JSON.parse(localStorage.getItem('materialsFolders') || '{}'); } catch(e) { return {}; }
}

function setMaterials(arr) { localStorage.setItem('materialsFolders', JSON.stringify(arr)); }

function renderMaterialFolders() {
    const container = document.getElementById('materialFolders');
    if (!container) return;
    const materials = getMaterials();
    container.innerHTML = '';

    Object.keys(materials).forEach(folderName => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'material-folder';
        if (currentFolder === folderName) button.classList.add('active');
        button.textContent = `${folderName} (${materials[folderName].length})`;
        button.addEventListener('click', () => {
            currentFolder = folderName;
            viewTitle.textContent = `Materials: ${folderName}`;
            showSavedOnly = false;
            currentView = 'posts';
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.posts-btn')?.classList.add('active');
            renderMaterialFolders();
            filterDiagrams();
        });
        container.appendChild(button);
    });
}

function createMaterialFolder(name) {
    if (!name) return;
    const materials = getMaterials();
    if (materials[name]) return;
    materials[name] = [];
    setMaterials(materials);
    renderMaterialFolders();
}

function removeFromAllFolders(id) {
    const materials = getMaterials();
    Object.keys(materials).forEach(folderName => {
        const index = materials[folderName].indexOf(id);
        if (index !== -1) {
            materials[folderName].splice(index, 1);
        }
        if (materials[folderName].length === 0) {
            delete materials[folderName];
        }
    });
    setMaterials(materials);
    renderMaterialFolders();
}

function addPostToFolder(folderName, id) {
    const materials = getMaterials();
    if (!materials[folderName]) return;
    if (!materials[folderName].includes(id)) {
        materials[folderName].push(id);
        setMaterials(materials);
        renderMaterialFolders();
    }
}

function promptFolderSelection(id) {
    const materials = getMaterials();
    const names = Object.keys(materials);
    let folderName = null;

    if (names.length === 0) {
        folderName = window.prompt('Enter a new materials folder name:');
        if (!folderName) return;
        createMaterialFolder(folderName.trim());
    } else {
        const list = names.map((name, index) => `${index + 1}. ${name}`).join('\n');
        const selection = window.prompt(`Choose a folder by number or type a new name:\n${list}`);
        if (!selection) return;
        const selectionIndex = parseInt(selection, 10);
        if (!isNaN(selectionIndex) && selectionIndex >= 1 && selectionIndex <= names.length) {
            folderName = names[selectionIndex - 1];
        } else {
            folderName = selection.trim();
            if (!folderName) return;
            if (!materials[folderName]) createMaterialFolder(folderName);
        }
    }

    if (folderName) addPostToFolder(folderName, id);
}

function resetMainView() {
    currentFolder = null;
    showSavedOnly = false;
    currentView = 'posts';
    viewTitle.textContent = 'All Posts';
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.posts-btn')?.classList.add('active');
    document.querySelector('#singlePostView')?.style.setProperty('display', 'none');
    document.querySelector('#diagramGrid')?.style.setProperty('display', '');
    document.querySelector('#sessionsView')?.style.setProperty('display', 'none');
    document.querySelector('#discussionsView')?.style.setProperty('display', 'none');
    document.querySelector('#shopView')?.style.setProperty('display', 'none');
    renderMaterialFolders();
    filterDiagrams();
}

function getJoinedSessions() {
    try { return JSON.parse(localStorage.getItem('joinedSessions') || '[]'); } catch(e) { return []; }
}

function setJoinedSessions(arr) { localStorage.setItem('joinedSessions', JSON.stringify(arr)); }

const STUDY_SESSIONS = [
    { id: 's1', title: 'Exam Review Sprint', description: 'Focus group for upcoming midterms — rapid review and quiz practice.', meta: 'Tue 5:30 PM · 45 min · 8 people joined' },
    { id: 's2', title: 'Physics Problem Solving', description: 'Collaborative problem session with guided examples and Q&A.', meta: 'Wed 7:00 PM · 60 min · 12 people joined' },
    { id: 's3', title: 'Language Practice Circle', description: 'Casual study space for vocabulary, grammar, and speaking practice.', meta: 'Thu 4:00 PM · 40 min · 10 people joined' }
];

function renderJoinedSessions() {
    const list = document.getElementById('joinedSessionsList');
    if (!list) return;
    const joined = getJoinedSessions();
    list.innerHTML = '';
    if (joined.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'empty-joined-sessions';
        placeholder.textContent = 'No joined sessions yet. Join one from the Sessions tab.';
        list.appendChild(placeholder);
        return;
    }
    joined.forEach(sessionId => {
        const session = STUDY_SESSIONS.find(s => s.id === sessionId);
        if (!session) return;
        const item = document.createElement('div');
        item.className = 'joined-session-item';
        item.innerHTML = `<strong>${session.title}</strong><p>${session.meta}</p>`;
        list.appendChild(item);
    });
}

function updateSessionButtons() {
    document.querySelectorAll('.join-session-btn').forEach(button => {
        const sessionId = button.dataset.sessionId;
        const joined = getJoinedSessions();
        button.textContent = joined.includes(sessionId) ? 'Joined' : 'Join';
        button.disabled = joined.includes(sessionId);
        button.classList.toggle('joined', joined.includes(sessionId));
    });
}

function handleJoinSession(sessionId) {
    const joined = getJoinedSessions();
    if (!joined.includes(sessionId)) {
        joined.push(sessionId);
        setJoinedSessions(joined);
        renderJoinedSessions();
        updateSessionButtons();
    }
}

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
    const materials = getMaterials();
    
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

        if (currentFolder) {
            const folderContents = materials[currentFolder] || [];
            if (!folderContents.includes(card.dataset.id)) {
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

    const folderButton = document.getElementById('addToFolderInline');
    if (folderButton) {
        folderButton.style.display = saved.includes(id) ? '' : 'none';
        folderButton.onclick = (e) => {
            e.stopPropagation();
            promptFolderSelection(id);
        };
    }

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
    document.getElementById('sessionsView')?.style.setProperty('display', 'none');
    singlePostView.style.display = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // wire actions
    likeInline.onclick = (e) => {
        e.stopPropagation();
        const l = getLikedPosts();
        const match = likeInline.textContent.match(/\d+/);
        let count = match ? parseInt(match[0]) : 0;
        if (l.includes(id)) {
            const index = l.indexOf(id);
            l.splice(index, 1);
            likeInline.classList.remove('liked');
            count = Math.max(0, count - 1);
        } else {
            l.push(id);
            likeInline.classList.add('liked');
            count += 1;
        }
        setLikedPosts(l);
        likeInline.textContent = `❤️ ${count}`;
    };

    saveInline.onclick = (e) => {
        e.stopPropagation();
        const s = getSavedPosts();
        const idx = s.indexOf(id);
        if (idx === -1) {
            s.push(id);
            saveInline.classList.add('saved');
            if (document.getElementById('addToFolderInline')) {
                document.getElementById('addToFolderInline').style.display = '';
            }
        } else {
            s.splice(idx,1);
            saveInline.classList.remove('saved');
            removeFromAllFolders(id);
            if (document.getElementById('addToFolderInline')) {
                document.getElementById('addToFolderInline').style.display = 'none';
            }
        }
        setSavedPosts(s);
    };

    followInline.onclick = (e) => {
        e.stopPropagation();
        const f = JSON.parse(localStorage.getItem('followedAuthors') || '[]');
        if (!f.includes(post.author)) {
            f.push(post.author);
            followInline.textContent = 'Following';
            followInline.classList.add('following');
        } else {
            const i = f.indexOf(post.author);
            f.splice(i,1);
            followInline.textContent = 'Follow';
            followInline.classList.remove('following');
        }
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
            removeFromAllFolders(id);
        }
        setSavedPosts(saved);
        renderMaterialFolders();
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
                likeBtn.textContent = likeBtn.textContent.replace(/\d+/, match => String(Number(match) + 1));
        }
    });

// Current view state
let currentView = 'posts';

// Posts and Videos button functionality
const postsBtn = document.querySelector('.posts-btn');
const videosBtn = document.querySelector('.videos-btn');
const sessionsBtn = document.querySelector('.sessions-btn');
const viewTitle = document.getElementById('viewTitle');
const diagramGrid = document.getElementById('diagramGrid');
const discussionsView = document.getElementById('discussionsView');
const shopView = document.getElementById('shopView');
const userPointsLabel = document.getElementById('userPointsLabel');
const joinedSessionsList = document.getElementById('joinedSessionsList');
const discussionsBtn = document.querySelector('.discussions-btn');
const shopBtn = document.querySelector('.shop-btn');

function switchView(view) {
    currentView = view;
    
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const sessionsViewElement = document.getElementById('sessionsView');
    const discussionViewElement = discussionsView;
    const shopViewElement = shopView;
    if (view === 'posts') {
        postsBtn?.classList.add('active');
        viewTitle.textContent = showSavedOnly ? 'Saved Posts' : 'All Posts';
        diagramGrid.style.display = 'grid';
        sessionsViewElement.style.display = 'none';
        discussionViewElement.style.display = 'none';
        shopViewElement.style.display = 'none';
    } else if (view === 'videos') {
        videosBtn?.classList.add('active');
        viewTitle.textContent = showSavedOnly ? 'Saved Videos' : 'All Videos';
        diagramGrid.style.display = 'grid';
        sessionsViewElement.style.display = 'none';
        discussionViewElement.style.display = 'none';
        shopViewElement.style.display = 'none';
    } else if (view === 'sessions') {
        sessionsBtn?.classList.add('active');
        viewTitle.textContent = 'Study Sessions';
        diagramGrid.style.display = 'none';
        sessionsViewElement.style.display = 'block';
        discussionViewElement.style.display = 'none';
        shopViewElement.style.display = 'none';
    } else if (view === 'discussions') {
        discussionsBtn?.classList.add('active');
        viewTitle.textContent = 'Discussion Boards';
        diagramGrid.style.display = 'none';
        sessionsViewElement.style.display = 'none';
        discussionViewElement.style.display = 'block';
        shopViewElement.style.display = 'none';
    } else if (view === 'shop') {
        shopBtn?.classList.add('active');
        viewTitle.textContent = 'Shop Prizes';
        diagramGrid.style.display = 'none';
        sessionsViewElement.style.display = 'none';
        discussionViewElement.style.display = 'none';
        shopViewElement.style.display = 'block';
    }
    
    filterDiagrams();
}

postsBtn?.addEventListener('click', () => {
    switchView('posts');
});

videosBtn?.addEventListener('click', () => {
    switchView('videos');
});

discussionsBtn?.addEventListener('click', () => {
    switchView('discussions');
});

shopBtn?.addEventListener('click', () => {
    switchView('shop');
});

sessionsBtn?.addEventListener('click', () => {
    switchView('sessions');
});

// Apply the default view filter on page load
filterDiagrams();
renderMaterialFolders();
renderJoinedSessions();
updateSessionButtons();

// Upload button functionality
const uploadOptions = document.querySelectorAll('.option-item');
if (uploadOptions.length > 0) {
    uploadOptions[0].addEventListener('click', () => {
        alert('Upload Diagram feature coming soon!');
    });
}

const uploadDiagramBtn = document.querySelector('.option-item[data-action="upload"]');
const savedBtn = document.querySelector('.option-item[data-action="saved"]');
const followingBtn = document.querySelector('.option-item[data-action="following"]');
const joinedDiscussionsBtn = document.querySelector('.option-item[data-action="joined-discussions"]');
const directMessagesBtn = document.querySelector('.option-item[data-action="direct-messages"]');
const connectSessionsBtn = document.querySelector('.option-item[data-action="connect-sessions"]');

uploadDiagramBtn?.addEventListener('click', () => {
    alert('Upload Diagram feature coming soon!');
});

savedBtn?.addEventListener('click', () => {
    showSavedOnly = !showSavedOnly;
    if (showSavedOnly) {
        viewTitle.textContent = currentView === 'videos' ? 'Saved Videos' : 'Saved Posts';
    } else {
        viewTitle.textContent = currentView === 'videos' ? 'All Videos' : 'All Posts';
    }
    filterDiagrams();
});

followingBtn?.addEventListener('click', () => {
    alert('View diagrams from users you follow!');
});

joinedDiscussionsBtn?.addEventListener('click', () => {
    switchView('discussions');
});

directMessagesBtn?.addEventListener('click', () => {
    alert('Direct Messages coming soon!');
});

connectSessionsBtn?.addEventListener('click', () => {
    alert('Study Sessions coming soon!');
});

// Notification button
const notificationBtn = document.querySelector('.notification-btn');
if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
        alert('No new notifications');
    });
}

function getUserPoints() {
    return Number(localStorage.getItem('userPoints') || '120');
}

function updatePointsLabel() {
    if (!userPointsLabel) return;
    const points = getUserPoints();
    userPointsLabel.textContent = `My Points: ${points}`;
}

updatePointsLabel();

// Create folder button
const createFolderBtn = document.getElementById('createFolderBtn');
createFolderBtn?.addEventListener('click', () => {
    const folderName = window.prompt('Enter a new materials folder name:');
    if (folderName) createMaterialFolder(folderName.trim());
});

// Session join buttons
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.join-session-btn');
    if (!btn) return;
    const sessionId = btn.dataset.sessionId;
    if (sessionId) handleJoinSession(sessionId);
});

// My Study Sessions shortcut
const mySessionsBtn = document.getElementById('mySessionsBtn');
mySessionsBtn?.addEventListener('click', () => {
    switchView('sessions');
});

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
