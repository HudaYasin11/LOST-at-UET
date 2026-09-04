// ========================================
// APP.JS - Main Application with Real API Data
// ========================================

import * as dataService from './dataService.js';
import * as api from './api.js';

// ========================================
// STATE
// ========================================

let currentFilter = 'all';

// Subscribe to data changes
dataService.subscribe((state) => {
    updateUI(state);
});

// ========================================
// INITIALIZE
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is authenticated
    const user = await api.getCurrentUser();
    
    if (user.success) {
        // Load all game data from API
        await dataService.loadGameData();
        updateHeaderProfile(dataService.getState().user);
    } else {
        // Not logged in - show login on protected pages
        const publicPages = ['index.html', 'login.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (!publicPages.includes(currentPage) && currentPage !== '') {
            window.location.href = 'login.html';
        }
    }
});

// ========================================
// UPDATE UI
// ========================================

function updateUI(state) {
    if (state.user) {
        updateHeaderProfile(state.user);
    }
    
    const page = getCurrentPage();
    switch (page) {
        case 'map':
            renderMapPage(state);
            break;
        case 'quests':
            renderQuestsPage(state);
            break;
        case 'discoveries':
            renderDiscoveriesPage(state);
            break;
        default:
            break;
    }
}

function updateHeaderProfile(user) {
    const displayName = document.getElementById('userDisplayName');
    const progressBar = document.getElementById('userProgressBar');
    const progressText = document.getElementById('userProgressText');
    
    if (displayName) {
        displayName.textContent = user.username || 'Explorer';
    }
    
    if (progressBar) {
        const progress = dataService.getCompletionPercentage();
        progressBar.style.width = progress + '%';
    }
    
    if (progressText) {
        const totalDisc = dataService.getTotalDiscoveries();
        const totalLoc = dataService.getTotalLocations();
        progressText.textContent = `${totalDisc}/${totalLoc}`;
    }
}

// ========================================
// MAP PAGE
// ========================================

function renderMapPage(state) {
    const container = document.getElementById('locationsContainer');
    if (!container) return;
    
    if (state.loading) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p style="margin-top:12px;color:var(--text-muted);">Loading locations...</p>
            </div>
        `;
        return;
    }
    
    const locations = state.locations || [];
    const filtered = currentFilter === 'all' 
        ? locations 
        : locations.filter(l => l.category === currentFilter);
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔍</span>
                <p>No locations found</p>
                <p style="font-size:12px;color:var(--text-muted);">Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(loc => {
        const isDiscovered = dataService.getLocationStatus(loc.id) === 'discovered';
        return `
            <div class="location-card ${isDiscovered ? 'discovered' : 'locked'}" 
                 onclick="window.openLocation('${loc.id}')">
                <div class="location-content">
                    <span class="icon">${loc.icon || '📍'}</span>
                    <div class="info">
                        <div class="name">${loc.name}</div>
                        <div class="category">${loc.category || 'Campus'}</div>
                    </div>
                    <div class="right">
                        <div class="status-badge ${isDiscovered ? 'discovered' : 'locked'}">
                            ${isDiscovered ? '✅' : '🔒'}
                        </div>
                        <div class="xp-badge">+${loc.xpReward || 0} XP</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// QUESTS PAGE
// ========================================

function renderQuestsPage(state) {
    const container = document.getElementById('questsContainer');
    if (!container) return;
    
    if (state.loading) {
        container.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p style="margin-top:12px;color:var(--text-muted);">Loading quests...</p>
            </div>
        `;
        return;
    }
    
    const quests = state.quests || [];
    
    if (quests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🎯</span>
                <p>No quests available yet</p>
                <p style="font-size:12px;color:var(--text-muted);">Check back later for new challenges!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = quests.map(quest => {
        const progress = dataService.getQuestProgress(quest.id);
        const completed = progress === 100;
        
        return `
            <div class="quest-card ${completed ? 'completed' : ''}">
                <div class="quest-icon">${quest.icon || '📋'}</div>
                <div class="quest-content">
                    <h4>${quest.name}</h4>
                    <p>${quest.description || ''}</p>
                    <div class="quest-meta">
                        <span class="quest-progress">${completed ? '✅ Completed' : '🔄 ' + progress + '%'}</span>
                        <span class="quest-reward">+${quest.xpReward || 0} XP</span>
                        <div class="quest-progress-bar">
                            <div class="quest-progress-fill" style="width:${progress}%;"></div>
                        </div>
                    </div>
                </div>
                ${completed 
                    ? '<span class="quest-done">✅ Done</span>' 
                    : `<button class="quest-arrow" onclick="window.startQuest('${quest.id}')">></button>`
                }
            </div>
        `;
    }).join('');
}

// ========================================
// DISCOVERIES PAGE
// ========================================

function renderDiscoveriesPage(state) {
    const locations = state.locations || [];
    const discovered = dataService.getTotalDiscoveries();
    const total = dataService.getTotalLocations();
    const progress = dataService.getCompletionPercentage();
    
    // Update progress
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = `${discovered}/${total}`;
    if (progressPercent) progressPercent.textContent = progress + '%';
    
    // Update stats
    const totalDiscovered = document.getElementById('totalDiscovered');
    const totalLocked = document.getElementById('totalLocked');
    const questsCompleted = document.getElementById('questsCompleted');
    const xpDisplay = document.getElementById('xpDisplay');
    const levelDisplay = document.getElementById('levelDisplay');
    
    if (totalDiscovered) totalDiscovered.textContent = discovered;
    if (totalLocked) totalLocked.textContent = total - discovered;
    if (questsCompleted) questsCompleted.textContent = state.user?.completedQuests?.length || 0;
    if (xpDisplay) xpDisplay.textContent = dataService.getTotalXP();
    if (levelDisplay) levelDisplay.textContent = dataService.getLevel();
    
    // Render discovery grid
    const grid = document.getElementById('discoveriesGrid');
    if (!grid) return;
    
    if (state.loading) {
        grid.innerHTML = `
            <div class="loading-spinner" style="grid-column:1/-1;">
                <div class="spinner"></div>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = locations.map(loc => {
        const isDiscovered = dataService.getLocationStatus(loc.id) === 'discovered';
        return `
            <div class="discovery-item ${isDiscovered ? 'unlocked' : 'locked'}"
                 onclick="window.openLocation('${loc.id}')">
                <span>${loc.icon || '📍'}</span>
                <span class="name">${loc.name}</span>
                <span class="badge">${isDiscovered ? '✅' : '🔒'}</span>
            </div>
        `;
    }).join('');
}

// ========================================
// LOCATION DETAILS
// ========================================

window.openLocation = async function(locationId) {
    const result = await api.getLocation(locationId);
    if (!result.success) {
        alert('Error loading location details');
        return;
    }
    
    const location = result.data;
    const isDiscovered = dataService.getLocationStatus(locationId) === 'discovered';
    
    const modal = document.getElementById('location-modal');
    if (!modal) return;
    
    modal.querySelector('.modal-icon').textContent = location.icon || '📍';
    modal.querySelector('h3').textContent = location.name;
    modal.querySelector('.modal-badge').textContent = location.category || 'Location';
    modal.querySelector('.modal-body p').textContent = location.description || '';
    
    const actions = modal.querySelector('.modal-actions');
    if (isDiscovered) {
        actions.innerHTML = `
            <button class="btn-outline" onclick="window.openGoogleMaps('${location.coordinates?.lat || ''}', '${location.coordinates?.lng || ''}')">
                📍 Open in Google Maps
            </button>
            <button class="btn-yellow" onclick="window.startQuestForLocation('${locationId}')">
                START QUEST
            </button>
        `;
    } else {
        actions.innerHTML = `
            <button class="btn-yellow" onclick="window.unlockLocation('${locationId}')">
                📷 SCAN QR TO UNLOCK
            </button>
        `;
    }
    
    openModal('location-modal');
};

// ========================================
// ACTIONS
// ========================================

window.unlockLocation = async function(locationId) {
    const result = await dataService.unlockLocation(locationId);
    if (result.success) {
        triggerUnlock();
        await dataService.refreshUserData();
    } else {
        alert('❌ Failed to unlock location: ' + (result.error || 'Unknown error'));
    }
};

window.startQuest = function(questId) {
    alert('🎯 Starting quest: ' + questId);
};

window.startQuestForLocation = function(locationId) {
    const state = dataService.getState();
    const quests = state.quests || [];
    const relatedQuest = quests.find(q => q.requirements?.target === locationId);
    if (relatedQuest) {
        window.startQuest(relatedQuest.id);
    } else {
        alert('No quest found for this location yet!');
    }
};

window.openGoogleMaps = function(lat, lng) {
    if (lat && lng) {
        window.open(`https://maps.google.com/maps?q=${lat},${lng}`, '_blank');
    } else {
        alert('Location coordinates not available');
    }
};

// ========================================
// FILTERS
// ========================================

window.filterLocations = function(filter) {
    currentFilter = filter;
    const state = dataService.getState();
    renderMapPage(state);
};

// ========================================
// MODAL CONTROLS
// ========================================

let currentModal = null;

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        currentModal = id;
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    if (currentModal) {
        const modal = document.getElementById(currentModal);
        if (modal) modal.classList.remove('active');
        currentModal = null;
        document.body.style.overflow = '';
    }
}

window.closeModal = closeModal;

// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

// Close modal on Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ========================================
// QR UNLOCK
// ========================================

window.triggerUnlock = function() {
    closeModal();
    setTimeout(() => {
        openModal('qr-modal');
    }, 300);
};

// ========================================
// GET CURRENT PAGE
// ========================================

function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('map')) return 'map';
    if (path.includes('quests')) return 'quests';
    if (path.includes('discoveries')) return 'discoveries';
    return 'landing';
}