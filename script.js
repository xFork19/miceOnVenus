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

// Accent color handling
const accentOptions = document.querySelectorAll('input[name="accentColor"]');
function applyAccent(value) {
    const parts = (value || '').split(',');
    const start = (parts[0] || '#667eea').trim();
    const end = (parts[1] || '#764ba2').trim();
    document.documentElement.style.setProperty('--accent-start', start);
    document.documentElement.style.setProperty('--accent-end', end);
    let foreground = '#2a2a72';
    if (start === '#2eb85c') foreground = '#0b6623';
    if (start === '#7b61ff') foreground = '#2b1b6f';
    if (start === '#ff9f43') foreground = '#6a3400';
    document.documentElement.style.setProperty('--accent-foreground', foreground);
    localStorage.setItem('accentGradient', value);
}

const savedAccent = localStorage.getItem('accentGradient') || '#667eea,#764ba2';
applyAccent(savedAccent);
accentOptions.forEach(opt => opt.addEventListener('change', (e) => applyAccent(e.target.value)));

// AI backend endpoint setting
const aiEndpointInput = document.getElementById('aiEndpointInput');
if (aiEndpointInput) {
    aiEndpointInput.value = localStorage.getItem('aiEndpoint') || 'http://127.0.0.1:8080';
    aiEndpointInput.addEventListener('change', () => {
        localStorage.setItem('aiEndpoint', aiEndpointInput.value.trim());
    });
}

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
const optionItems = document.querySelectorAll('.option-item');
const searchBar = document.querySelector('.search-bar');
const diagramGrid = document.getElementById('diagramGrid');

let currentCategory = 'all';
let currentSearch = '';
let showSavedOnly = false;
let currentFolder = null;

function clearSidebarSelection() {
    categoryItems.forEach(i => i.classList.remove('active'));
    optionItems.forEach(i => i.classList.remove('active'));
}

function selectOptionItem(item) {
    clearSidebarSelection();
    item?.classList.add('active');
}

function getMaterials() {
    try { return JSON.parse(localStorage.getItem('materialsFolders') || '{}'); } catch(e) { return {}; }
}

function setMaterials(arr) { localStorage.setItem('materialsFolders', JSON.stringify(arr)); }

function getUserUploads() {
    try { return JSON.parse(localStorage.getItem('userUploads') || '[]'); } catch(e) { return []; }
}

function setUserUploads(arr) { localStorage.setItem('userUploads', JSON.stringify(arr)); }

function getCartItems() {
    try { return JSON.parse(localStorage.getItem('cartItems') || '[]'); } catch(e) { return []; }
}

function setCartItems(arr) { localStorage.setItem('cartItems', JSON.stringify(arr)); }

function renderCart() {
    const cartList = document.getElementById('cartList');
    const cartTotal = document.getElementById('cartTotal');
    if (!cartList || !cartTotal) return;
    const items = getCartItems();
    cartList.innerHTML = '';
    let total = 0;

    if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'cart-item';
        empty.textContent = 'Your cart is empty. Purchase prizes in the shop.';
        cartList.appendChild(empty);
    } else {
        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `<span>${item.name}</span><span>${item.cost} pts</span>`;
            cartList.appendChild(row);
            total += Number(item.cost || 0);
        });
    }

    cartTotal.textContent = `${total} points`;
}

function addToCart(name, cost) {
    const cart = getCartItems();
    cart.push({ name, cost });
    setCartItems(cart);
    renderCart();
}

function clearCart() {
    setCartItems([]);
    renderCart();
}

const DISCUSSION_BOARDS = [
    {
        id: 'd1',
        title: 'AP Exam Study Strategies',
        description: 'Discuss AP review plans, resources, and time management for exam day.',
        joined: 238,
        threads: [
            {
                id: 'dt1',
                boardId: 'd1',
                title: 'Best AP Calculus practice schedule?',
                author: 'Maya King',
                views: 120,
                replies: [
                    { author: 'Alex Pat', content: 'I do short focused practice every day and review free-response problems on weekends.' },
                    { author: 'Maya King', content: 'Past FRQs from 2015-2020 helped me the most.' }
                ]
            },
            {
                id: 'dt2',
                boardId: 'd1',
                title: 'How do you survive AP Physics multiple choice?',
                author: 'Liam Patel',
                views: 89,
                replies: [
                    { author: 'Olivia Brooks', content: 'Use process of elimination and watch the units carefully on each answer.' },
                    { author: 'Leo Grant', content: 'Practice with timed sets so the pacing feels normal.' }
                ]
            }
        ]
    },
    {
        id: 'd2',
        title: 'SAT Prep & Strategies',
        description: 'Talk about test strategies, practice materials, and score improvement tips.',
        joined: 194,
        threads: [
            {
                id: 'dt3',
                boardId: 'd2',
                title: 'Best SAT math resources?',
                author: 'Ava Chen',
                views: 75,
                replies: [
                    { author: 'Noah Rivera', content: 'Khan Academy and daily timed drills were game changers.' },
                    { author: 'Mia Thompson', content: 'I liked using sample problem sets by topic and then reviewing mistakes.' }
                ]
            },
            {
                id: 'dt4',
                boardId: 'd2',
                title: 'Reading section timing tips',
                author: 'Nora Woods',
                views: 104,
                replies: [
                    { author: 'Ethan Nguyen', content: 'Skim passages first and focus on main idea questions quickly.' },
                    { author: 'Zoe Brooks', content: 'Underline evidence and watch out for extreme answer choices.' }
                ]
            }
        ]
    },
    {
        id: 'd3',
        title: 'Calculus Study Strategies',
        description: 'Share calculus notes, problem-solving methods, and review tactics.',
        joined: 276,
        threads: [
            {
                id: 'dt5',
                boardId: 'd3',
                title: 'How do you remember derivatives rules?',
                author: 'Kai Shah',
                views: 98,
                replies: [
                    { author: 'Luna Carter', content: 'I use flashcards and write them out from memory every couple of days.' },
                    { author: 'Iris Murphy', content: 'Grouping the rules by function type helped me retain them.' }
                ]
            },
            {
                id: 'dt6',
                boardId: 'd3',
                title: 'AP Calculus practice exam recommendations',
                author: 'Eli Harper',
                views: 142,
                replies: [
                    { author: 'Ruby Gray', content: 'The official College Board tests are the best predictor of exam style.' },
                    { author: 'Finn Brooks', content: 'I also liked using prep books with explanations for every question.' }
                ]
            }
        ]
    }
];

const DISCUSSION_PROFILES = {
    'Maya King': { name: 'Maya King', bio: 'AP exam enthusiast and study strategy sharer.', posts: 12, joinedBoards: 3, recent: ['Best AP Calculus practice schedule?', 'Study tips for late-night review'] },
    'Alex Pat': { name: 'Alex Pat', bio: 'Senior who loves dividing study sessions into small chunks.', posts: 8, joinedBoards: 2, recent: ['Best AP Calculus practice schedule?', 'How to use flashcards efficiently'] },
    'Liam Patel': { name: 'Liam Patel', bio: 'Physics student sharing exam pacing tips.', posts: 6, joinedBoards: 2, recent: ['How do you survive AP Physics multiple choice?'] },
    'Ava Chen': { name: 'Ava Chen', bio: 'SAT prep coach and math practice leader.', posts: 11, followers: 320, joinedBoards: 3, recent: ['Best SAT math resources?', 'Vocabulary memorization tricks'] },
    'Nora Woods': { name: 'Nora Woods', bio: 'Reading section expert helping students find their rhythm.', posts: 9, followers: 276, joinedBoards: 2, recent: ['Reading section timing tips'] }
};

let currentDiscussionBoard = 'd1';
let currentDiscussionThread = null;

function getSavedDiscussionThreads() {
    try { return JSON.parse(localStorage.getItem('savedDiscussionThreads') || '[]'); } catch (e) { return []; }
}

function setSavedDiscussionThreads(arr) {
    localStorage.setItem('savedDiscussionThreads', JSON.stringify(arr));
}

function getSavedReplies(threadId) {
    try { return JSON.parse(localStorage.getItem(`discussionReplies_${threadId}`) || '[]'); } catch (e) { return []; }
}

function setSavedReplies(threadId, arr) {
    localStorage.setItem(`discussionReplies_${threadId}`, JSON.stringify(arr));
}

function getDiscussionBoard(boardId) {
    return DISCUSSION_BOARDS.find(board => board.id === boardId);
}

function getDiscussionThreads(boardId) {
    const savedThreads = getSavedDiscussionThreads().filter(thread => thread.boardId === boardId);
    const board = getDiscussionBoard(boardId);
    return board ? [...board.threads, ...savedThreads] : savedThreads;
}

function renderDiscussionBoards() {
    const boardList = document.getElementById('discussionBoardList');
    if (!boardList) return;
    boardList.innerHTML = '';
    DISCUSSION_BOARDS.forEach(board => {
        const item = document.createElement('div');
        item.className = `discussion-card${board.id === currentDiscussionBoard ? ' active' : ''}`;
        item.dataset.boardId = board.id;
        item.innerHTML = `
            <h4>${board.title}</h4>
            <p>${board.description}</p>
            <span class="discussion-meta">Joined: ${board.joined} students</span>
        `;
        item.addEventListener('click', () => {
            showDiscussionBoard(board.id);
        });
        boardList.appendChild(item);
    });
}

function showDiscussionBoard(boardId) {
    currentDiscussionBoard = boardId;
    currentDiscussionThread = null;
    const board = getDiscussionBoard(boardId);
    if (!board) return;
    document.getElementById('discussionBoardTitle').textContent = board.title;
    document.getElementById('discussionBoardDescription').textContent = board.description;
    document.getElementById('discussionThreadDetail').style.display = 'none';
    document.getElementById('threadList').style.display = 'block';
    document.getElementById('newThreadForm').style.display = 'none';
    document.getElementById('discussionProfileView')?.style.setProperty('display', 'none');
    renderDiscussionBoards();
    renderDiscussionThreadList(boardId);
}

function renderDiscussionThreadList(boardId) {
    const threadList = document.getElementById('threadList');
    if (!threadList) return;
    const threads = getDiscussionThreads(boardId);
    threadList.innerHTML = '';
    threads.forEach(thread => {
        const card = document.createElement('div');
        card.className = 'discussion-thread-card';
        card.dataset.threadId = thread.id;
        card.innerHTML = `
            <div class="thread-meta-row">
                <strong>${thread.title}</strong>
                <span>${thread.views} views • ${thread.points || 2} pts</span>
            </div>
            <p>Started by <button class="thread-author-link">${thread.author}</button></p>
            <div class="thread-tags">${(thread.tags || []).map(tag => `<span class="tag-badge">${tag}</span>`).join('')}</div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.closest('.thread-author-link')) return;
            openDiscussionThread(thread.id);
        });
        card.querySelector('.thread-author-link')?.addEventListener('click', (e) => {
            e.stopPropagation();
            showProfile(thread.author);
        });
        threadList.appendChild(card);
    });
}

function openDiscussionThread(threadId) {
    const thread = getDiscussionThreads(currentDiscussionBoard).find(t => t.id === threadId);
    if (!thread) return;
    currentDiscussionThread = threadId;
    document.getElementById('discussionThreadDetail').style.display = 'block';
    document.getElementById('threadList').style.display = 'none';
    document.getElementById('newThreadForm').style.display = 'none';
    document.getElementById('discussionProfileView')?.style.setProperty('display', 'none');
    document.getElementById('threadTitle').textContent = thread.title;
    const authorBtn = document.getElementById('threadAuthor');
    authorBtn.textContent = thread.author;
    authorBtn.onclick = () => showProfile(thread.author);
    document.getElementById('threadViews').textContent = `${thread.views + 1} views`;
    const messagesBox = document.getElementById('threadMessages');
    messagesBox.innerHTML = '';
    if (thread.fileData) {
        const attachment = document.createElement('div');
        attachment.className = 'discussion-attachment';
        attachment.innerHTML = thread.mediaType === 'video'
            ? `<video controls src="${thread.fileData}" preload="metadata"></video>`
            : `<img src="${thread.fileData}" alt="Thread attachment">`;
        messagesBox.appendChild(attachment);
    }
    const baseReplies = thread.replies || [];
    const savedReplies = getSavedReplies(threadId);
    const allReplies = [...baseReplies, ...savedReplies];
    allReplies.forEach(reply => {
        const row = document.createElement('div');
        row.className = 'thread-message';
        row.innerHTML = `
            <button class="message-author">${reply.author}</button>
            <p>${reply.content}</p>
        `;
        row.querySelector('.message-author')?.addEventListener('click', () => showProfile(reply.author));
        messagesBox.appendChild(row);
    });
}

function showNewThreadForm() {
    document.getElementById('newThreadForm').style.display = 'block';
    document.getElementById('discussionThreadDetail').style.display = 'none';
    document.getElementById('threadList').style.display = 'block';
    document.getElementById('discussionProfileView')?.style.setProperty('display', 'none');
}

function cancelNewThread() {
    document.getElementById('newThreadForm').style.display = 'none';
}

function createNewThread() {
    const title = document.getElementById('newThreadTitle')?.value.trim();
    const author = document.getElementById('newThreadAuthor')?.value.trim() || 'Anonymous';
    const message = document.getElementById('newThreadMessage')?.value.trim();
    const fileInput = document.getElementById('threadMediaInput');
    if (!title || !message) {
        alert('Please add both a thread title and a message.');
        return;
    }

    const newThread = {
        id: `new_${Date.now()}`,
        boardId: currentDiscussionBoard,
        title,
        author,
        views: 0,
        replies: [{ author, content: message }],
        tags: [],
        points: 2
    };

    const saveThread = (fileData, mediaType) => {
        if (fileData) {
            newThread.fileData = fileData;
            newThread.mediaType = mediaType;
        }
        const savedThreads = getSavedDiscussionThreads();
        savedThreads.push(newThread);
        setSavedDiscussionThreads(savedThreads);
        document.getElementById('newThreadTitle').value = '';
        document.getElementById('newThreadAuthor').value = '';
        document.getElementById('newThreadMessage').value = '';
        if (fileInput) fileInput.value = '';
        document.getElementById('newThreadForm').style.display = 'none';
        renderDiscussionThreadList(currentDiscussionBoard);
        openDiscussionThread(newThread.id);
        setUserPoints(getUserPoints() + 2);
        updatePointsLabel();
        alert('Thread posted! You earned 2 points.');
    };

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            saveThread(reader.result, file.type.startsWith('video/') ? 'video' : 'image');
        };
        reader.readAsDataURL(file);
    } else {
        saveThread(null, null);
    }
}

function replyToThread(e) {
    e.preventDefault();
    if (!currentDiscussionThread) return;
    const author = document.getElementById('replyAuthor')?.value.trim() || 'Anonymous';
    const message = document.getElementById('replyMessage')?.value.trim();
    if (!message) return;
    const replies = getSavedReplies(currentDiscussionThread);
    replies.push({ author, content: message });
    setSavedReplies(currentDiscussionThread, replies);
    document.getElementById('replyMessage').value = '';
    document.getElementById('replyAuthor').value = '';
    setUserPoints(getUserPoints() + 2);
    updatePointsLabel();
    alert('Reply posted! You earned 2 points.');
    openDiscussionThread(currentDiscussionThread);
}

function showProfile(author) {
    // remember which view opened the profile
    if (singlePostView && singlePostView.style.display && singlePostView.style.display !== 'none') lastViewBeforeProfile = 'singlePost';
    else if (document.getElementById('discussionsView')?.style.display === 'block') lastViewBeforeProfile = 'discussions';
    else lastViewBeforeProfile = currentView || 'posts';

    const profile = DISCUSSION_PROFILES[author] || { name: author, bio: 'Active member of the study community.', posts: 0, joinedBoards: 1, recent: [] };
    document.getElementById('discussionProfileView').style.display = 'block';
    // hide other views
    document.getElementById('discussionsView').style.display = 'none';
    document.getElementById('discussionThreadDetail').style.display = 'none';
    if (singlePostView) singlePostView.style.display = 'none';
    if (diagramGrid) diagramGrid.style.display = 'none';
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profileBio').textContent = profile.bio;
    document.getElementById('profilePostsCount').textContent = `Posts: ${profile.posts}`;
    document.getElementById('profileFollowersCount').textContent = `Followers: ${profile.followers || 0}`;
    document.getElementById('profileJoinedCount').textContent = `Joined Boards: ${profile.joinedBoards}`;

    const authorPosts = Object.values(POSTS).filter(post => post.author === author);
    const recent = document.getElementById('profileRecentPosts');
    recent.innerHTML = '<h4>Other posts</h4>' + (authorPosts.length
        ? authorPosts.slice(0, 5).map(p => `<button class="profile-post-link" data-post-id="${p.id}">${p.title}</button>`).join('')
        : '<p>No other posts yet.</p>');

    recent.querySelectorAll('.profile-post-link').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = button.dataset.postId;
            if (postId) openSinglePost(postId);
        });
    });
}

function closeProfileView() {
    document.getElementById('discussionProfileView').style.display = 'none';
    // restore previous view
    if (lastViewBeforeProfile === 'singlePost') {
        if (singlePostView) singlePostView.style.display = '';
    } else if (lastViewBeforeProfile === 'discussions') {
        document.getElementById('discussionsView').style.display = 'block';
    } else {
        if (diagramGrid) diagramGrid.style.display = '';
    }
}

function backToThreadList() {
    document.getElementById('discussionThreadDetail').style.display = 'none';
    document.getElementById('threadList').style.display = 'block';
}

const IMAGE_FILE_LIST = [
    'a1.jpg','a10.jpg','a2.jpg','a3.png','a4.jpg','a5.jpg','a6.png','a7.jpg','a8.jpg','a9.jpg',
    'b1.png','b10.jpg','b2.jpg','b3.jpg','b4.png','b5.jpg','b6.png','b7.jpg','b8.jpg','b9.jpg',
    'c1.png','c10.jpg','c3.png','c4.jpg','c5.jpg','c6.jpg','c7.jpg','c8.png','c9.png',
    'd1.webp','d10.jpg','d2.jpeg','d3.webp','d4.jpg','d5.png','d6.png','d7.png','d8.png','d9.webp',
    'm1.webp','m10.png','m2.jpg','m3.png','m5.webp','m6.jpg','m7.png','m8.jpg','m9.jpg',
    'p5.jpg'
];

const IMAGE_CATEGORIES = {
    a: {category:'Arts & Design', tags:['art','visual design','creative']},
    b: {category:'Science', tags:['biology','life science','ecosystems']},
    c: {category:'Science', tags:['chemistry','reactions','molecules']},
    d: {category:'Science', tags:['physics','motion','energy']},
    m: {category:'Mathematics', tags:['algebra','calculus','geometry']},
    p: {category:'Science', tags:['technology','innovation','STEM']}
};

const CATEGORY_TITLES = {
    'Arts & Design': ['Creative Layout Guide', 'Design Flow Map', 'Visual Study Plan', 'Art Strategy Diagram'],
    'Science': ['Science Concept Map', 'Study Lab Workflow', 'Experiment Revision Guide', 'STEM Review Diagram'],
    'Mathematics': ['Math Strategy Map', 'Problem Solving Guide', 'Calculus Review Diagram', 'Algebra Flowchart']
};

function getReadablePostTitle(filename, category, index) {
    const titles = CATEGORY_TITLES[category] || [`${category} Diagram`];
    return titles[index % titles.length];
}


const AUTHOR_NAMES = [
    'Ava Chen', 'Liam Patel', 'Mia Thompson', 'Noah Rivera', 'Zoe Brooks',
    'Ethan Nguyen', 'Luna Carter', 'Jayden Kim', 'Iris Murphy', 'Riley Scott',
    'Avery Brooks', 'Mason Lee', 'Kai Shah', 'Nova Lopez', 'Eli Harper',
    'Sage Patel', 'Aria Johnson', 'Leo Grant', 'Maya Blake', 'Owen Fox',
    'Nora Woods', 'Jade Reed', 'Ezra Clark', 'Lila Hughes', 'Max Chen',
    'Parker Cruz', 'Luna Hart', 'Finn Brooks', 'Ruby Gray', 'Theo Adams'
];

const POSTS = {};
IMAGE_FILE_LIST.forEach((filename, index) => {
    const prefix = filename[0];
    const meta = IMAGE_CATEGORIES[prefix] || {category:'Science', tags:['study','science']};
    const id = filename.replace(/[^a-zA-Z0-9]/g, '_');
    const title = getReadablePostTitle(filename, meta.category, index);
    POSTS[id] = {
        id,
        title,
        author: AUTHOR_NAMES[index % AUTHOR_NAMES.length],
        category: meta.category,
        tags: [...meta.tags, 'study'],
        image: `post_images/${filename}`,
        likes: 50 + ((index * 7) % 200),
        content: `A helpful ${meta.category.toLowerCase()} diagram focused on ${meta.tags.join(', ')}.`, 
        type: 'post',
        points: 5
    };
});

function renderInitialPosts() {
    Object.values(POSTS)
        .sort((a, b) => a.id.localeCompare(b.id))
        .forEach(post => addUploadCardToFeed(post));
}

function loadUserUploads() {
    const uploads = getUserUploads();
    uploads.forEach(upload => {
        POSTS[upload.id] = upload;
        addUploadCardToFeed(upload);
    });
}

function addUploadCardToFeed(upload) {
    const card = document.createElement('div');
    card.className = 'diagram-card';
    card.dataset.id = upload.id;
    card.dataset.type = upload.type === 'video' ? 'video' : 'post';
    card.dataset.category = upload.category || 'General';
    card.dataset.tags = (upload.tags || []).join(',');

    const mediaPreview = upload.mediaType === 'video'
        ? `<video controls src="${upload.fileData || upload.image}" preload="metadata"></video>`
        : `<img src="${upload.fileData || upload.image}" alt="${upload.title}">`;

    card.innerHTML = `
        <div class="diagram-placeholder">
            ${upload.fileData || upload.image ? mediaPreview : `<span>${upload.type === 'video' ? '🎥' : '📊'}</span>`}
            <p>${upload.title}</p>
        </div>
        <div class="card-info">
            <h3>${upload.title}</h3>
            <p class="card-author">by <button class="profile-link">${upload.author}</button></p>
            <div class="card-meta">
                <span>${upload.category}</span>
                <span>${upload.points || (upload.type === 'video' ? 15 : 5)} pts</span>
                <span class="like-btn">❤️ ${upload.likes || 0}</span>
                <button class="save-btn" title="Save">🔖</button>
            </div>
            <div class="card-tags">${(upload.tags || []).map(tag => `<span class="tag-badge">${tag}</span>`).join('')}</div>
        </div>
    `;

    diagramGrid.appendChild(card);
    attachCardInteractivity(card);
}

function attachCardInteractivity(card) {
    const likeBtn = card.querySelector('.like-btn');
    const saveBtn = card.querySelector('.save-btn');

    card.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn') || e.target.closest('.save-btn')) return;
        const id = card.dataset.id;
        if (id) openSinglePost(id);
    });

    likeBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = card.dataset.id;
        if (!id) return;
        const liked = getLikedPosts();
        const match = likeBtn.textContent.match(/\d+/);
        let count = match ? parseInt(match[0]) : 0;
        if (liked.includes(id)) {
            const index = liked.indexOf(id);
            liked.splice(index, 1);
            likeBtn.classList.remove('liked');
            count = Math.max(0, count - 1);
        } else {
            liked.push(id);
            likeBtn.classList.add('liked');
            count += 1;
        }
        likeBtn.textContent = `❤️ ${count}`;
        setLikedPosts(liked);
    });

    saveBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = card.dataset.id;
        if (!id) return;
        const saved = getSavedPosts();
        const idx = saved.indexOf(id);
        if (idx === -1) {
            saved.push(id);
            saveBtn.classList.add('saved');
        } else {
            saved.splice(idx, 1);
            saveBtn.classList.remove('saved');
            removeFromAllFolders(id);
        }
        setSavedPosts(saved);
        renderMaterialFolders();
    });

    const profileLink = card.querySelector('.profile-link');
    profileLink?.addEventListener('click', (e) => {
        e.stopPropagation();
        const authorName = profileLink.textContent?.trim();
        if (authorName) showProfile(authorName);
    });
}

function publishUpload() {
    const titleInput = document.getElementById('uploadTitle');
    const categoryInput = document.getElementById('uploadCategory');
    const descriptionInput = document.getElementById('uploadDescription');
    const typeInput = document.getElementById('uploadType');
    const fileInput = document.getElementById('uploadMediaInput');
    const visibility = document.querySelector('input[name="uploadVisibility"]:checked')?.value || 'public';
    const status = document.getElementById('uploadStatus');

    if (!titleInput || !categoryInput || !descriptionInput || !typeInput || !status) return;
    const title = titleInput.value.trim();
    const category = categoryInput.value.trim() || 'General';
    const content = descriptionInput.value.trim();
    const type = typeInput.value;

    if (!title || !content) {
        status.textContent = 'Please enter a title and description to publish.';
        return;
    }

    const id = `u${Date.now()}`;
    const upload = {
        id,
        title,
        author: 'You',
        category,
        likes: 0,
        content: `${content} (${visibility === 'private' ? 'Private' : 'Public'})`,
        type,
        visibility,
        tags: [category.toLowerCase(), 'study'],
        points: type === 'video' ? 15 : 5
    };

    const processUpload = (fileData, mediaType) => {
        if (fileData) {
            upload.fileData = fileData;
            upload.mediaType = mediaType;
        }
        const uploads = getUserUploads();
        uploads.push(upload);
        setUserUploads(uploads);
        POSTS[id] = upload;
        addUploadCardToFeed(upload);

        const reward = upload.points;
        setUserPoints(getUserPoints() + reward);
        updatePointsLabel();

        titleInput.value = '';
        categoryInput.value = '';
        descriptionInput.value = '';
        if (fileInput) fileInput.value = '';
        status.textContent = `Published! You've earned ${reward} points.`;
        filterDiagrams();
    };

    if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const accepted = file.type.startsWith('image/') || file.type.startsWith('video/');
        if (!accepted) {
            status.textContent = 'Please attach an image or video file.';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            processUpload(reader.result, file.type.startsWith('video/') ? 'video' : 'image');
        };
        reader.readAsDataURL(file);
    } else {
        processUpload(null, null);
    }
}

function showUploadPreview() {
    const preview = document.getElementById('uploadPreview');
    const fileInput = document.getElementById('uploadMediaInput');
    if (!preview || !fileInput || !fileInput.files.length) {
        if (preview) preview.innerHTML = '';
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        preview.innerHTML = file.type.startsWith('video/')
            ? `<video controls src="${reader.result}" preload="metadata"></video>`
            : `<img src="${reader.result}" alt="Upload preview">`;
    };
    reader.readAsDataURL(file);
}

function showThreadPreview() {
    const preview = document.getElementById('threadPreview');
    const fileInput = document.getElementById('threadMediaInput');
    if (!preview || !fileInput || !fileInput.files.length) {
        if (preview) preview.innerHTML = '';
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
        preview.innerHTML = file.type.startsWith('video/')
            ? `<video controls src="${reader.result}" preload="metadata"></video>`
            : `<img src="${reader.result}" alt="Thread preview">`;
    };
    reader.readAsDataURL(file);
}

function attachUploadedCardStates() {
    document.querySelectorAll('.diagram-card').forEach(card => {
        const likeBtn = card.querySelector('.like-btn');
        const saveBtn = card.querySelector('.save-btn');
        const id = card.dataset.id;
        if (!id) return;
        const saved = getSavedPosts();
        const liked = getLikedPosts();
        if (saveBtn && saved.includes(id)) {
            saveBtn.classList.add('saved');
        }
        if (likeBtn && liked.includes(id)) {
            likeBtn.classList.add('liked');
        }
    });
}

function setupNewUploads() {
    loadUserUploads();
    attachUploadedCardStates();
}

function createMaterialFolder(name) {
    if (!name) return;
    const materials = getMaterials();
    if (materials[name]) return;
    materials[name] = [];
    setMaterials(materials);
    renderMaterialFolders();
}

function renderMaterialFolders() {
    const container = document.getElementById('materialFolders');
    if (!container) return;

    const materials = getMaterials();
    container.innerHTML = '';
    const names = Object.keys(materials);

    if (names.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'material-empty';
        empty.textContent = 'No material folders yet. Save a post and add it to a folder.';
        container.appendChild(empty);
        return;
    }

    names.forEach(name => {
        const ids = materials[name] || [];
        const folder = document.createElement('div');
        folder.className = 'material-folder';
        folder.innerHTML = `
            <div class="material-folder-header">
                <strong>${name}</strong>
                <span>${ids.length} item${ids.length === 1 ? '' : 's'}</span>
            </div>
        `;

        const actions = document.createElement('div');
        actions.className = 'material-folder-actions';

        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = 'material-folder-view';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', () => {
            currentFolder = name;
            showSavedOnly = false;
            viewTitle.textContent = `${name}`;
            filterDiagrams();
        });

        const clearBtn = document.createElement('button');
        clearBtn.type = 'button';
        clearBtn.className = 'material-folder-clear';
        clearBtn.textContent = 'Clear';
        clearBtn.addEventListener('click', () => {
            const updated = getMaterials();
            delete updated[name];
            setMaterials(updated);
            renderMaterialFolders();
            if (currentFolder === name) {
                currentFolder = null;
                viewTitle.textContent = 'All Posts';
                filterDiagrams();
            }
        });

        actions.appendChild(viewBtn);
        actions.appendChild(clearBtn);
        folder.appendChild(actions);
        container.appendChild(folder);
    });
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
    clearSidebarSelection();
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.posts-btn')?.classList.add('active');
    document.querySelector('#singlePostView')?.style.setProperty('display', 'none');
    document.querySelector('#uploadView')?.style.setProperty('display', 'none');
    document.querySelector('#diagramGrid')?.style.setProperty('display', '');
    document.querySelector('#sessionsView')?.style.setProperty('display', 'none');
    document.querySelector('#discussionsView')?.style.setProperty('display', 'none');
    document.querySelector('#shopView')?.style.setProperty('display', 'none');
    document.querySelector('#followingView')?.style.setProperty('display', 'none');
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

function getSessionParticipants() {
    try { return JSON.parse(localStorage.getItem('sessionParticipants') || '{}'); } catch(e) { return {}; }
}

function setSessionParticipants(value) {
    localStorage.setItem('sessionParticipants', JSON.stringify(value));
}

function addSessionParticipant(sessionId, name) {
    const participants = getSessionParticipants();
    participants[sessionId] = participants[sessionId] || [];
    if (!participants[sessionId].includes(name)) {
        participants[sessionId].push(name);
    }
    setSessionParticipants(participants);
}

function getSessionStatus(sessionId) {
    const statuses = JSON.parse(localStorage.getItem('sessionStatuses') || '{}');
    return statuses[sessionId] || 'Starting soon';
}

function setSessionStatus(sessionId, status) {
    const statuses = JSON.parse(localStorage.getItem('sessionStatuses') || '{}');
    statuses[sessionId] = status;
    localStorage.setItem('sessionStatuses', JSON.stringify(statuses));
}

function renderSessionLobby(sessionId) {
    const lobby = document.getElementById('sessionLobby');
    const titleEl = document.getElementById('lobbySessionTitle');
    const statusEl = document.getElementById('lobbySessionStatus');
    const descriptionEl = document.getElementById('lobbySessionDescription');
    const participantsEl = document.getElementById('lobbyParticipants');
    const participateBtn = document.getElementById('participateSessionBtn');
    const session = STUDY_SESSIONS.find(s => s.id === sessionId);
    if (!lobby || !session) return;

    const joined = getJoinedSessions();
    const participants = getSessionParticipants()[sessionId] || [];
    const isJoined = joined.includes(sessionId);

    titleEl.textContent = session.title;
    descriptionEl.textContent = session.description;
    statusEl.textContent = getSessionStatus(sessionId);

    participantsEl.innerHTML = '';
    if (participants.length === 0) {
        participantsEl.innerHTML = '<div class="session-participant">No one has joined yet. Be the first!</div>';
    } else {
        participants.forEach(name => {
            const participant = document.createElement('div');
            participant.className = 'session-participant';
            participant.textContent = name;
            participantsEl.appendChild(participant);
        });
    }

    participateBtn.textContent = isJoined ? 'Participate now' : 'Join session first';
    participateBtn.disabled = !isJoined;
    participateBtn.onclick = () => {
        if (!isJoined) {
            alert('Please join the session first.');
            return;
        }
        setSessionStatus(sessionId, 'Live now');
        statusEl.textContent = 'Live now';
        alert(`You are now participating in ${session.title}.`);
    };
    lobby.style.display = 'block';
}

function handleJoinSession(sessionId) {
    const joined = getJoinedSessions();
    if (!joined.includes(sessionId)) {
        joined.push(sessionId);
        setJoinedSessions(joined);
        addSessionParticipant(sessionId, 'You');
        renderJoinedSessions();
        updateSessionButtons();
    }
    renderSessionLobby(sessionId);
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
        clearSidebarSelection();
        item.classList.add('active');
        const selectedCategory = item.dataset.category;
        if (currentView !== 'posts' && currentView !== 'videos') {
            resetMainView();
        }
        currentCategory = selectedCategory;
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

// Small client-side post dataset (used for single-post view)

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

    // Show image — load the post image if available
    if (post.image) {
        postImage.innerHTML = `<img src="${post.image}" alt="${post.title}">`;
    } else {
        const card = document.querySelector(`.diagram-card[data-id="${id}"]`);
        const placeholder = card ? card.querySelector('.diagram-placeholder').innerHTML : '';
        postImage.innerHTML = placeholder || '📷';
    }

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

    // AI assistant chat
    const aiMessages = document.getElementById('aiMessages');
    const aiInput = document.getElementById('aiInput');
    const aiSendBtn = document.getElementById('aiSendBtn');
    const aiStatus = document.getElementById('aiStatus');
    if (aiMessages) aiMessages.innerHTML = '';
    if (aiInput) aiInput.value = '';

    function appendAiMessage(role, text) {
        if (!aiMessages) return;
        const d = document.createElement('div');
        d.className = 'ai-message ' + (role === 'user' ? 'ai-user' : 'ai-assistant');
        d.textContent = text;
        aiMessages.appendChild(d);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    async function sendAiPrompt(prompt) {
    const endpoint = 'http://127.0.01:8080/api/ask-gemini'; 
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientPrompt: prompt })
    });
    const j = await res.json();
    return j.answer || j.answer_text || (j.result && j.result.answer) || JSON.stringify(j);
}

    if (aiSendBtn) {
        aiSendBtn.onclick = async (e) => {
            e.stopPropagation();
            const prompt = (aiInput && aiInput.value || '').trim();
            if (!prompt) return;
            appendAiMessage('user', prompt);
            if (aiStatus) aiStatus.textContent = 'Thinking...';
            try {
                const answer = await sendAiPrompt(prompt);
                appendAiMessage('assistant', answer);
            } catch (err) {
                appendAiMessage('assistant', 'Sorry, the AI service is unavailable.');
            } finally {
                if (aiStatus) aiStatus.textContent = '';
            }
        };
    }

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
    document.getElementById('uploadView')?.style.setProperty('display', 'none');
    document.getElementById('sessionsView')?.style.setProperty('display', 'none');
    document.getElementById('discussionsView')?.style.setProperty('display', 'none');
    document.getElementById('shopView')?.style.setProperty('display', 'none');
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

    // allow opening author's profile from single post view
    if (postAuthor) {
        postAuthor.style.cursor = 'pointer';
        postAuthor.title = `View ${post.author}'s profile`;
        postAuthor.onclick = (e) => {
            e.stopPropagation();
            showProfile(post.author);
        };
    }

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

// Current view state
let currentView = 'posts';
let lastViewBeforeProfile = null;

// Posts and Videos button functionality
const postsBtn = document.querySelector('.posts-btn');
const videosBtn = document.querySelector('.videos-btn');
const sessionsBtn = document.querySelector('.sessions-btn');
const viewTitle = document.getElementById('viewTitle');
const discussionsView = document.getElementById('discussionsView');
const shopView = document.getElementById('shopView');
const uploadView = document.getElementById('uploadView');
const userPointsLabel = document.getElementById('userPointsLabel');
const joinedSessionsList = document.getElementById('joinedSessionsList');
const discussionsBtn = document.querySelector('.discussions-btn');
const shopBtn = document.querySelector('.shop-btn');
const followingView = document.getElementById('followingView');
const followedAuthorsList = document.getElementById('followedAuthorsList');

function showFollowingView() {
    currentView = 'following';
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    viewTitle.textContent = 'Following';
    diagramGrid.style.display = 'none';
    document.getElementById('sessionsView')?.style.setProperty('display','none');
    document.getElementById('uploadView')?.style.setProperty('display','none');
    document.getElementById('discussionsView')?.style.setProperty('display','none');
    document.getElementById('shopView')?.style.setProperty('display','none');
    singlePostView?.style.setProperty('display','none');
    followingView?.style.setProperty('display','block');

    if (!followedAuthorsList) return;
    const followed = JSON.parse(localStorage.getItem('followedAuthors') || '[]');
    followedAuthorsList.innerHTML = '';

    if (!Array.isArray(followed) || followed.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'follow-empty';
        empty.textContent = 'You are not following anyone yet. Open a post and click Follow to add creators here.';
        followedAuthorsList.appendChild(empty);
        return;
    }

    const uniqueAuthors = [...new Set(followed)];
    uniqueAuthors.forEach(author => {
        const authorPosts = Object.values(POSTS).filter(post => post.author === author);
        const card = document.createElement('div');
        card.className = 'follow-card';
        card.innerHTML = `
            <div class="follow-card-title">
                <button class="follow-card-author">${author}</button>
                <span>${authorPosts.length} ${authorPosts.length === 1 ? 'post' : 'posts'}</span>
            </div>
            <div class="follow-card-meta">
                ${authorPosts.slice(0, 3).map(post => `<span>${post.title}</span>`).join('')}
            </div>
        `;
        card.querySelector('.follow-card-author')?.addEventListener('click', () => showProfile(author));
        followedAuthorsList.appendChild(card);
    });
}

function switchView(view) {
    currentView = view;
    
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('discussionProfileView')?.style.setProperty('display', 'none');
    
    const sessionsViewElement = document.getElementById('sessionsView');
    const discussionViewElement = discussionsView;
    const shopViewElement = shopView;
    const followingViewElement = document.getElementById('followingView');
    followingViewElement?.style.setProperty('display', 'none');
    if (view === 'posts') {
        postsBtn?.classList.add('active');
        viewTitle.textContent = showSavedOnly ? 'Saved Posts' : 'All Posts';
        diagramGrid.style.display = 'grid';
        sessionsViewElement.style.display = 'none';
        uploadView?.style.setProperty('display', 'none');
        discussionViewElement.style.display = 'none';
        shopViewElement.style.display = 'none';
    } else if (view === 'videos') {
        videosBtn?.classList.add('active');
        viewTitle.textContent = showSavedOnly ? 'Saved Videos' : 'All Videos';
        diagramGrid.style.display = 'grid';
        sessionsViewElement.style.display = 'none';
        uploadView?.style.setProperty('display', 'none');
        discussionViewElement.style.display = 'none';
        shopViewElement.style.display = 'none';
    } else if (view === 'sessions') {
        sessionsBtn?.classList.add('active');
        viewTitle.textContent = 'Study Sessions';
        diagramGrid.style.display = 'none';
        sessionsViewElement.style.display = 'block';
        uploadView?.style.setProperty('display', 'none');
        discussionViewElement.style.display = 'none';
        shopViewElement.style.display = 'none';
    } else if (view === 'discussions') {
        discussionsBtn?.classList.add('active');
        viewTitle.textContent = 'Discussion Boards';
        diagramGrid.style.display = 'none';
        sessionsViewElement.style.display = 'none';
        uploadView?.style.setProperty('display', 'none');
        discussionViewElement.style.display = 'block';
        document.getElementById('discussionProfileView')?.style.setProperty('display', 'none');
        showDiscussionBoard(currentDiscussionBoard);
        shopViewElement.style.display = 'none';
    } else if (view === 'shop') {
        shopBtn?.classList.add('active');
        viewTitle.textContent = 'Shop Prizes';
        diagramGrid.style.display = 'none';
        sessionsViewElement.style.display = 'none';
        uploadView?.style.setProperty('display', 'none');
        discussionViewElement.style.display = 'none';
        shopViewElement.style.display = 'block';
    } else if (view === 'upload') {
        viewTitle.textContent = 'Publish Content';
        diagramGrid.style.display = 'none';
        sessionsViewElement.style.display = 'none';
        uploadView?.style.setProperty('display', 'block');
        discussionViewElement.style.display = 'none';
        shopViewElement.style.display = 'none';
    }

    singlePostView?.style.setProperty('display', 'none');
    filterDiagrams();
}

postsBtn?.addEventListener('click', () => {
    clearSidebarSelection();
    resetMainView();
});

videosBtn?.addEventListener('click', () => {
    clearSidebarSelection();
    switchView('videos');
});

discussionsBtn?.addEventListener('click', () => {
    clearSidebarSelection();
    switchView('discussions');
});

shopBtn?.addEventListener('click', () => {
    clearSidebarSelection();
    switchView('shop');
});

sessionsBtn?.addEventListener('click', () => {
    clearSidebarSelection();
    switchView('sessions');
});

// Apply the default view filter on page load
renderInitialPosts();
setupNewUploads();
filterDiagrams();
renderMaterialFolders();
renderJoinedSessions();
updateSessionButtons();
renderCart();
updatePointsLabel();

const uploadDiagramBtn = document.querySelector('.option-item[data-action="upload"]');
const savedBtn = document.querySelector('.option-item[data-action="saved"]');
const followingBtn = document.querySelector('.option-item[data-action="following"]');
const joinedDiscussionsBtn = document.querySelector('.option-item[data-action="joined-discussions"]');
const directMessagesBtn = document.querySelector('.option-item[data-action="direct-messages"]');
const connectSessionsBtn = document.querySelector('.option-item[data-action="connect-sessions"]');
const publishUploadBtn = document.getElementById('publishUploadBtn');
const clearCartBtn = document.getElementById('clearCartBtn');

uploadDiagramBtn?.addEventListener('click', () => {
    selectOptionItem(uploadDiagramBtn);
    switchView('upload');
});

publishUploadBtn?.addEventListener('click', publishUpload);
clearCartBtn?.addEventListener('click', clearCart);

savedBtn?.addEventListener('click', () => {
    if (showSavedOnly) {
        clearSidebarSelection();
    } else {
        selectOptionItem(savedBtn);
    }
    showSavedOnly = !showSavedOnly;
    if (currentView !== 'posts' && currentView !== 'videos') {
        switchView('posts');
    }
    if (showSavedOnly) {
        viewTitle.textContent = currentView === 'videos' ? 'Saved Videos' : 'Saved Posts';
    } else {
        viewTitle.textContent = currentView === 'videos' ? 'All Videos' : 'All Posts';
    }
    filterDiagrams();
});

followingBtn?.addEventListener('click', () => {
    selectOptionItem(followingBtn);
    showFollowingView();
});

joinedDiscussionsBtn?.addEventListener('click', () => {
    selectOptionItem(joinedDiscussionsBtn);
    switchView('discussions');
});

directMessagesBtn?.addEventListener('click', () => {
    selectOptionItem(directMessagesBtn);
    alert('Direct Messages coming soon!');
});

connectSessionsBtn?.addEventListener('click', () => {
    selectOptionItem(connectSessionsBtn);
    switchView('sessions');
});

function getUserPoints() {
    return Number(localStorage.getItem('userPoints') || '120');
}

function setUserPoints(value) {
    localStorage.setItem('userPoints', String(Math.max(0, value)));
}

function getShopRedemptions() {
    try { return JSON.parse(localStorage.getItem('shopRedemptions') || '[]'); } catch (e) { return []; }
}

function setShopRedemptions(arr) {
    localStorage.setItem('shopRedemptions', JSON.stringify(arr));
}

function updatePointsLabel() {
    if (!userPointsLabel) return;
    const points = getUserPoints();
    userPointsLabel.textContent = `My Points: ${points}`;
}

shopView?.addEventListener('click', (e) => {
    const button = e.target.closest('.redeem-btn');
    if (!button) return;
    e.stopPropagation();

    const card = button.closest('.shop-item');
    if (!card) return;

    const item = card.dataset.item || card.querySelector('h4')?.textContent || 'Reward';
    const cost = Number(card.dataset.cost || card.querySelector('.prize-cost')?.textContent.replace(/[^\d]/g, '') || 0);
    const points = getUserPoints();

    if (points < cost) {
        alert(`You need ${cost} points to redeem ${item}, but you only have ${points}.`);
        return;
    }

    setUserPoints(points - cost);
    updatePointsLabel();

    const redemptions = getShopRedemptions();
    redemptions.push({ item, cost, redeemedAt: new Date().toISOString() });
    setShopRedemptions(redemptions);
    addToCart(item, cost);

    alert(`Success! You redeemed ${item} for ${cost} points and it has been added to your cart.`);
});

updatePointsLabel();

const newThreadBtn = document.getElementById('newThreadBtn');
const cancelThreadBtn = document.getElementById('cancelThreadBtn');
const createThreadBtn = document.getElementById('createThreadBtn');
const replyForm = document.getElementById('replyForm');
const closeProfileViewBtn = document.getElementById('closeProfileView');
const backToThreadsBtn = document.getElementById('backToThreadsBtn');

newThreadBtn?.addEventListener('click', showNewThreadForm);
cancelThreadBtn?.addEventListener('click', cancelNewThread);
createThreadBtn?.addEventListener('click', createNewThread);
replyForm?.addEventListener('submit', replyToThread);
closeProfileViewBtn?.addEventListener('click', closeProfileView);
backToThreadsBtn?.addEventListener('click', backToThreadList);

// Create folder button
const createFolderBtn = document.getElementById('createFolderBtn');
createFolderBtn?.addEventListener('click', () => {
    const folderName = window.prompt('Enter a new materials folder name:');
    if (folderName) createMaterialFolder(folderName.trim());
});

// Session join buttons and lobby view controls
document.addEventListener('click', (e) => {
    const joinBtn = e.target.closest('.join-session-btn');
    if (joinBtn) {
        const sessionId = joinBtn.dataset.sessionId;
        if (sessionId) handleJoinSession(sessionId);
        return;
    }
    const viewBtn = e.target.closest('.view-session-btn');
    if (viewBtn) {
        const sessionId = viewBtn.dataset.sessionId;
        if (sessionId) renderSessionLobby(sessionId);
        return;
    }
    const closeBtn = e.target.closest('#closeLobbyBtn');
    if (closeBtn) {
        const lobby = document.getElementById('sessionLobby');
        if (lobby) lobby.style.display = 'none';
    }
});

const uploadMediaInput = document.getElementById('uploadMediaInput');
uploadMediaInput?.addEventListener('change', showUploadPreview);

const threadMediaInput = document.getElementById('threadMediaInput');
threadMediaInput?.addEventListener('change', showThreadPreview);

// My Study Sessions shortcut
const mySessionsBtn = document.getElementById('mySessionsBtn');
mySessionsBtn?.addEventListener('click', () => {
    switchView('sessions');
});

// Sidebar collapsible sections
const collapseToggles = document.querySelectorAll('.collapse-toggle');
collapseToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        const section = e.target.closest('.sidebar-section');
        if (!section) return;
        const isCollapsed = section.classList.toggle('collapsed');
        toggle.setAttribute('aria-expanded', String(!isCollapsed));
    });
});

// Profile button
const profileBtn = document.querySelector('.profile-btn');
const profileModal = document.getElementById('profileModal');
const profileModalClose = document.getElementById('profileModalClose');
const profilePictureInput = document.getElementById('profilePictureInput');
const profilePicturePreview = document.getElementById('profilePicturePreview');
const profileAvatarWrapper = document.getElementById('profileAvatarWrapper');
const profileNameInput = document.getElementById('profileName');
const profilePronounsInput = document.getElementById('profilePronouns');
const profileGenderInput = document.getElementById('profileGender');
const profileStatusInput = document.getElementById('profileStatus');
const profileBioInput = document.getElementById('profileBio');
const profileLocationInput = document.getElementById('profileLocation');
const profileInterestsInput = document.getElementById('profileInterests');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const clearProfileBtn = document.getElementById('clearProfileBtn');

function getProfileData() {
    try {
        return JSON.parse(localStorage.getItem('profileData') || '{}');
    } catch (e) {
        return {};
    }
}

function setProfileData(data) {
    localStorage.setItem('profileData', JSON.stringify(data));
}

function updateProfilePreview(data) {
    if (data.picture) {
        profilePicturePreview.src = data.picture;
        profilePicturePreview.style.display = 'block';
        profileAvatarWrapper.querySelector('.profile-avatar-placeholder').style.display = 'none';
    } else {
        profilePicturePreview.src = '';
        profilePicturePreview.style.display = 'none';
        profileAvatarWrapper.querySelector('.profile-avatar-placeholder').style.display = 'block';
    }
}

function loadProfileData() {
    const data = getProfileData();
    profileNameInput.value = data.name || '';
    profilePronounsInput.value = data.pronouns || '';
    profileGenderInput.value = data.gender || '';
    profileStatusInput.value = data.status || '';
    profileBioInput.value = data.bio || '';
    profileLocationInput.value = data.location || '';
    profileInterestsInput.value = data.interests || '';
    updateProfilePreview(data);
}

function openProfileModal() {
    profileModal?.classList.add('active');
    loadProfileData();
}

function closeProfileModal() {
    profileModal?.classList.remove('active');
}

profileBtn?.addEventListener('click', openProfileModal);
profileModalClose?.addEventListener('click', closeProfileModal);
profileModal?.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        closeProfileModal();
    }
});

profilePictureInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        const data = getProfileData();
        data.picture = reader.result;
        setProfileData(data);
        updateProfilePreview(data);
    };
    reader.readAsDataURL(file);
});

saveProfileBtn?.addEventListener('click', () => {
    const data = {
        picture: getProfileData().picture || '',
        name: profileNameInput.value.trim(),
        pronouns: profilePronounsInput.value.trim(),
        gender: profileGenderInput.value,
        status: profileStatusInput.value.trim(),
        bio: profileBioInput.value.trim(),
        location: profileLocationInput.value.trim(),
        interests: profileInterestsInput.value.trim()
    };
    setProfileData(data);
    updateProfilePreview(data);
    closeProfileModal();
});

clearProfileBtn?.addEventListener('click', () => {
    setProfileData({});
    loadProfileData();
});

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
        profileModal?.classList.remove('active');
    }
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';
