// ========================================
// DATA SERVICE - Bridge between UI and API
// ========================================

import * as api from './api.js';

// ========================================
// STATE
// ========================================

let appState = {
    user: null,
    locations: [],
    quests: [],
    loading: false,
    error: null,
    isAuthenticated: false
};

const listeners = [];

// ========================================
// NOTIFY LISTENERS
// ========================================

function notifyListeners() {
    listeners.forEach(listener => listener(appState));
}

export function subscribe(listener) {
    listeners.push(listener);
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
    };
}

export function getState() {
    return appState;
}

// ========================================
// LOAD DATA FROM API
// ========================================

export async function loadGameData() {
    console.log('🔄 loadGameData: Starting...');
    appState.loading = true;
    appState.error = null;
    notifyListeners();
    
    try {
        // 1. Check if user is authenticated
        console.log('📡 Getting current user...');
        const userResult = await api.getCurrentUser();
        console.log('📡 User result:', userResult);
        
        if (userResult.success) {
            appState.user = userResult.data;
            appState.isAuthenticated = true;
            console.log('✅ User authenticated:', userResult.data);
        } else {
            console.warn('❌ Not authenticated:', userResult.error);
            appState.isAuthenticated = false;
            appState.loading = false;
            notifyListeners();
            return { success: false, error: 'Not authenticated' };
        }
        
        // 2. Load locations from API
        console.log('📡 Loading locations...');
        const locationsResult = await api.getLocations();
        console.log('📡 Locations result:', locationsResult);
        
        if (locationsResult.success) {
            // ✅ Make sure we're getting the array correctly
            appState.locations = locationsResult.data || [];
            console.log('✅ Locations loaded:', appState.locations.length);
        } else {
            console.warn('⚠️ Failed to load locations:', locationsResult.error);
            appState.locations = [];
        }
        
        // 3. Load quests from API
        console.log('📡 Loading quests...');
        const questsResult = await api.getQuests();
        console.log('📡 Quests result:', questsResult);
        
        if (questsResult.success) {
            appState.quests = questsResult.data || [];
            console.log('✅ Quests loaded:', appState.quests.length);
        } else {
            console.warn('⚠️ Failed to load quests:', questsResult.error);
            appState.quests = [];
        }
        
        appState.loading = false;
        notifyListeners();
        console.log('✅ loadGameData: Complete!');
        return { success: true };
        
    } catch (error) {
        console.error('❌ loadGameData error:', error);
        appState.loading = false;
        appState.error = error.message;
        notifyListeners();
        return { success: false, error: error.message };
    }
}

// ========================================
// REFRESH DATA
// ========================================

export async function refreshUserData() {
    const result = await api.getCurrentUser();
    if (result.success) {
        appState.user = result.data;
        notifyListeners();
    }
    return result;
}

export async function refreshLocations() {
    const result = await api.getLocations();
    if (result.success) {
        appState.locations = result.data;
        notifyListeners();
    }
    return result;
}

export async function refreshQuests() {
    const result = await api.getQuests();
    if (result.success) {
        appState.quests = result.data;
        notifyListeners();
    }
    return result;
}

// ========================================
// GAME ACTIONS (CALL API)
// ========================================

export async function unlockLocation(locationId) {
    const result = await api.unlockLocation(locationId);
    if (result.success) {
        await refreshUserData();
        await refreshLocations();
        notifyListeners();
    }
    return result;
}

export async function completeQuest(questId) {
    const result = await api.completeQuest(questId);
    if (result.success) {
        await refreshUserData();
        await refreshQuests();
        notifyListeners();
    }
    return result;
}

export async function scanQR(qrCode) {
    const result = await api.scanQR(qrCode);
    if (result.success) {
        await refreshUserData();
        await refreshLocations();
        notifyListeners();
    }
    return result;
}

// ========================================
// HELPERS FOR UI
// ========================================

export function getLocationStatus(locationId) {
    if (!appState.user) return 'locked';
    const discoveries = appState.user.discoveries || [];
    return discoveries.includes(locationId) ? 'discovered' : 'locked';
}

export function getQuestProgress(questId) {
    if (!appState.user) return 0;
    const completedQuests = appState.user.completedQuests || [];
    return completedQuests.includes(questId) ? 100 : 0;
}

export function getTotalXP() {
    return appState.user?.xp || 0;
}

export function getLevel() {
    const xp = appState.user?.xp || 0;
    return Math.floor(xp / 100) + 1;
}

export function getTotalDiscoveries() {
    return appState.user?.discoveries?.length || 0;
}

export function getTotalLocations() {
    return appState.locations.length || 0;
}

export function getCompletionPercentage() {
    const discovered = getTotalDiscoveries();
    const total = getTotalLocations();
    return total > 0 ? Math.round((discovered / total) * 100) : 0;
}

export function isAuthenticated() {
    return appState.isAuthenticated;
}

// ========================================
// LEADERBOARD
// ========================================

export async function getLeaderboard(limit = 10) {
    return await api.getLeaderboard(limit);
}

// ========================================
// EXPORT
// ========================================

export default {
    loadGameData,
    refreshUserData,
    refreshLocations,
    refreshQuests,
    unlockLocation,
    completeQuest,
    scanQR,
    getState,
    subscribe,
    getLocationStatus,
    getQuestProgress,
    getTotalXP,
    getLevel,
    getTotalDiscoveries,
    getTotalLocations,
    getCompletionPercentage,
    isAuthenticated,
    getLeaderboard
};