// ========================================
// APP.JS - Main Application
// ========================================

import { getCurrentUser, signOut } from './auth.js';
import { loadGameData, getState, getTotalXP, getLevel, getTotalDiscoveries, getTotalLocations, getLocationStatus, unlockLocation, completeQuest, refreshUserData } from './dataService.js';
import { getLocations, getLocation } from './api.js';

// ========================================
// DOM REFS
// ========================================
const locationsContainer = document.getElementById('locationsContainer');
const questsContainer = document.getElementById('questsContainer');
const discoveriesGrid = document.getElementById('discoveriesGrid');

// ========================================
// STATE
// ========================================
let currentFilter = 'all';
let allLocations = [];
let allQuests = [];
let questFilter = 'all';

// ========================================
// LOAD DATA
// ========================================
export async function loadData() {
    try {
        const user = await getCurrentUser();
        if (!user.success) {
            if (!window.location.pathname.includes('index.html') && 
                !window.location.pathname.includes('signup.html') &&
                !window.location.pathname.includes('login.html')) {
                window.location.href = 'index.html';
            }
            return;
        }

        await loadGameData();
        const state = getState();
        allLocations = state.locations || [];
        allQuests = state.quests || [];
        
        updateHeader();
        updateStats();
        renderAll();
        
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// ========================================
// UPDATE HEADER
// ========================================
export function updateHeader() {
    const state = getState();
    const user = state.user;
    const discoveries = getTotalDiscoveries();
    const total = getTotalLocations();
    const progress = getCompletionPercentage();

    const displayName = document.getElementById('userDisplayName');
    const progressBar = document.getElementById('userProgressBar');
    const progressText = document.getElementById('userProgressText');

    if (displayName) {
        displayName.textContent = user?.name || user?.username || 'Explorer';
    }
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    if (progressText) {
        progressText.textContent = `${discoveries}/${total}`;
    }
}

// ========================================
// UPDATE STATS
// ========================================
export function updateStats() {
    const xpEl = document.getElementById('mapXP') || document.getElementById('questXP') || document.getElementById('homeXP');
    const discoveriesEl = document.getElementById('mapDiscoveries') || document.getElementById('questDiscoveries') || document.getElementById('homeDiscoveries');
    const levelEl = document.getElementById('mapLevel') || document.getElementById('homeLevel');

    if (xpEl) xpEl.textContent = getTotalXP() + ' XP';
    if (discoveriesEl) discoveriesEl.textContent = getTotalDiscoveries() + ' Discovered';
    if (levelEl) levelEl.textContent = 'Level ' + getLevel();
}

// ========================================
// RENDER LOCATIONS (Map Page)
// ========================================
export function renderLocations() {
    if (!locationsContainer) return;

    const filtered = currentFilter === 'all' 
        ? allLocations 
        : allLocations.filter(l => l.category === currentFilter);

    if (filtered.length === 0) {
        locationsContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔍</span>
                <p>No locations found</p>
            </div>
        `;
        return;
    }

    locationsContainer.innerHTML = filtered.map(loc => {
        const isDiscovered = getLocationStatus(loc.id) === 'discovered';
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
                        <div class="xp-badge">+${loc.xp || 0} XP</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ========================================
// RENDER QUESTS (Quests Page)
// ========================================
export function renderQuests() {
    if (!questsContainer) return;

    let filtered = allQuests;
    if (questFilter === 'active') {
        filtered = allQuests.filter(q => getQuestProgress(q.id) > 0 && getQuestProgress(q.id) < 100);
    } else if (questFilter === 'completed') {
        filtered = allQuests.filter(q => getQuestProgress(q.id) === 100);
    }

    if (filtered.length === 0) {
        questsContainer.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🎯</span>
                <p>No quests available</p>
            </div>
        `;
        return;
    }

    questsContainer.innerHTML = filtered.map(quest => {
        const progress = getQuestProgress(quest.id);
        const completed = progress === 100;
        
        return `
            <div class="quest-card ${completed ? 'completed' : ''}">
                <div class="quest-icon">${quest.icon || '📋'}</div>
                <div class="quest-content">
                    <h4>${quest.title || quest.name || 'Quest'}</h4>
                    <p>${quest.description || 'Complete this quest to earn XP!'}</p>
                    <div class="quest-meta">
                        <span class="quest-progress">${completed ? '✅ Completed' : '🔄 ' + progress + '%'}</span>
                        <span class="quest-reward">+${quest.xp || 0} XP</span>
                        <div class="quest-progress-bar">
                            <div class="quest-progress-fill" style="width:${progress}%;"></div>
                        </div>
                    </div>
                </div>
                ${completed 
                    ? '<span class="quest-done">✅ Done</span>' 
                    : `<button class="quest-arrow" onclick="window.completeQuest('${quest.id}')">></button>`
                }
            </div>
        `;
    }).join('');
}

// ========================================
// RENDER DISCOVERIES (Discoveries Page)
// ========================================
export function renderDiscoveries() {
    if (!discoveriesGrid) return;

    if (allLocations.length === 0) {
        discoveriesGrid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <span class="empty-icon">🔍</span>
                <p>No locations found</p>
            </div>
        `;
        return;
    }

    discoveriesGrid.innerHTML = allLocations.map(loc => {
        const isDiscovered = getLocationStatus(loc.id) === 'discovered';
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
// RENDER ALL
// ========================================
export function renderAll() {
    const page = window.location.pathname;
    if (page.includes('map')) {
        renderLocations();
    } else if (page.includes('quests')) {
        renderQuests();
    } else if (page.includes('discoveries')) {
        renderDiscoveries();
    }
}

// ========================================
// OPEN LOCATION
// ========================================
window.openLocation = async function(locationId) {
    try {
        const result = await getLocation(locationId);
        if (!result.success) {
            alert('Error loading location details');
            return;
        }

        const location = result.data;
        const isDiscovered = getLocationStatus(locationId) === 'discovered';

        const modal = document.getElementById('location-modal');
        if (!modal) return;
        
        modal.querySelector('.modal-icon').textContent = location.icon || '📍';
        modal.querySelector('h3').textContent = location.name || 'Location';
        modal.querySelector('.modal-badge').textContent = location.category || 'Location';
        document.getElementById('locationDescription').textContent = location.description || 'No description available.';

        const infoContainer = document.getElementById('locationInfo');
        if (infoContainer) {
            infoContainer.innerHTML = `
                <span>📍 ${location.landmark || 'Campus location'}</span>
                <span>💡 ${location.tip || 'Explore to learn more!'}</span>
                <span>⭐ +${location.xp || 0} XP</span>
            `;
        }

        const actions = document.getElementById('locationActions');
        if (actions) {
            if (isDiscovered) {
                actions.innerHTML = `
                    <button class="btn-outline" onclick="window.openGoogleMaps()">📍 Open in Google Maps</button>
                    <button class="btn-yellow" onclick="window.startQuestForLocation('${locationId}')">START QUEST</button>
                `;
            } else {
                actions.innerHTML = `
                    <button class="btn-yellow" onclick="window.unlockLocation('${locationId}')">📷 SCAN QR TO UNLOCK</button>
                `;
            }
        }

        openModal('location-modal');
    } catch (error) {
        console.error('Error opening location:', error);
        alert('Error loading location details');
    }
};

// ========================================
// UNLOCK LOCATION
// ========================================
window.unlockLocation = async function(locationId) {
    try {
        const result = await unlockLocation(locationId);
        if (result.success) {
            const location = allLocations.find(l => l.id === locationId);
            document.getElementById('unlockedLocationName').textContent = location?.name || 'Location';
            document.getElementById('unlockedXP').textContent = `+${result.data?.xp_awarded || 100} XP`;
            
            await refreshUserData();
            await loadGameData();
            
            const state = getState();
            allLocations = state.locations || [];
            allQuests = state.quests || [];
            
            updateHeader();
            updateStats();
            renderAll();
            
            closeModal();
            setTimeout(() => {
                openModal('qr-modal');
            }, 300);
        } else {
            alert('❌ Failed to unlock location: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Unlock error:', error);
        alert('❌ Failed to unlock location');
    }
};

// ========================================
// COMPLETE QUEST
// ========================================
window.completeQuest = async function(questId) {
    try {
        const result = await completeQuest(questId);
        if (result.success) {
            alert('🎉 Quest completed! +' + (result.data?.xp_awarded || 0) + ' XP');
            await refreshUserData();
            await loadGameData();
            const state = getState();
            allQuests = state.quests || [];
            updateStats();
            renderQuests();
        } else {
            alert('❌ Failed to complete quest: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Complete quest error:', error);
        alert('❌ Failed to complete quest');
    }
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

window.closeModal = function() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
};

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// ========================================
// FILTERS
// ========================================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        renderLocations();
    });
});

document.querySelectorAll('.quest-filter .filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.quest-filter .filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        questFilter = this.dataset.filter;
        renderQuests();
    });
});

// ========================================
// INIT
// ========================================
loadData();